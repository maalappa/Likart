import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  Mic,
  MicOff,
  Clock,
  TrendingUp,
  Sparkles,
  Plus,
  Minus,
  Store,
  UtensilsCrossed,
  ArrowRight,
  Star,
  Trash2,
  Command,
  Flame,
  Check,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MenuItem, Restaurant } from '../../types';
import {
  QUICK_COMMERCE_ITEMS,
  quickCommerceItemToMenuItem,
} from '../../data/quickCommerceData';

interface SmartSearchBoxProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  className?: string;
  isMobile?: boolean;
}

const TRENDING_SEARCHES = [
  { term: 'Biryani', label: '🔥 Dum Biryani', icon: '🍗' },
  { term: 'Pizza', label: '🍕 Cheesy Pizza', icon: '🧀' },
  { term: 'Burger', label: '🍔 Juicy Burgers', icon: '🍔' },
  { term: 'Paneer', label: '🍲 Paneer Butter Masala', icon: '🧈' },
  { term: 'Momos', label: '🥟 Steamed & Fried Momos', icon: '🥟' },
  { term: 'Veg Thali', label: '🥗 Pure Veg Meals', icon: '🥦' },
  { term: 'Desserts', label: '🍨 Shakes & Desserts', icon: '🧁' },
  { term: 'Rolls', label: '🌯 Kathi Rolls & Shawarma', icon: '🌯' },
  { term: 'Coffee', label: '☕ Filter Coffee & Beverages', icon: '☕' },
];

const ROTATING_PLACEHOLDERS = [
  "Search for 'Hyderabadi Dum Biryani'...",
  "Search for 'Wood-fired Truffle Pizza'...",
  "Search for 'Paneer Butter Masala'...",
  "Search for 'Crispy Smash Burger'...",
  "Search for 'Steamed & Tandoori Momos'...",
  "Search for 'Gulab Jamun & Ice Cream'...",
  "Search for restaurants or dishes...",
];

export const SmartSearchBox: React.FC<SmartSearchBoxProps> = ({
  searchQuery,
  setSearchQuery,
  className = '',
  isMobile = false,
}) => {
  const {
    restaurants,
    menuItems,
    cart,
    addToCart,
    updateCartQuantity,
    setSelectedRestaurantId,
    setCustomerView,
    addNotification,
    martProducts,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'dishes' | 'restaurants' | 'veg'>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under150' | '150to300' | 'above300'>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'price_low' | 'price_high' | 'rating'>('relevance');
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [addedItemAnimId, setAddedItemAnimId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load and persist Recent Searches
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('likart_recent_searches');
      return saved ? JSON.parse(saved) : ['Biryani', 'Pizza', 'Paneer', 'Burgers'];
    } catch {
      return ['Biryani', 'Pizza', 'Paneer', 'Burgers'];
    }
  });

  const saveRecentSearch = (term: string) => {
    const clean = term.trim();
    if (!clean || clean.length < 2) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, 8);
      try {
        localStorage.setItem('likart_recent_searches', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const removeRecentSearch = (e: React.MouseEvent, termToRemove: string) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== termToRemove);
      try {
        localStorage.setItem('likart_recent_searches', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const clearAllRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem('likart_recent_searches');
    } catch {
      // ignore
    }
  };

  // Rotating placeholder
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % ROTATING_PLACEHOLDERS.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut listener: '/' or 'Cmd+K' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is already typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') {
          setIsOpen(false);
          inputRef.current?.blur();
        }
        return;
      }

      if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Web Speech API Voice Search
  const handleToggleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceNotice('Voice search is not supported by your browser. Please type to search.');
      setTimeout(() => setVoiceNotice(null), 4000);
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceNotice('Listening... Speak restaurant or food name now');
        setIsOpen(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          const cleaned = transcript.trim();
          setSearchQuery(cleaned);
          saveRecentSearch(cleaned);
          setVoiceNotice(`Searching for: "${cleaned}"`);
          setTimeout(() => setVoiceNotice(null), 2500);
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        setVoiceNotice('Could not capture audio. Please try speaking again.');
        setTimeout(() => setVoiceNotice(null), 3000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('Failed to start speech recognition:', err);
      setIsListening(false);
      setVoiceNotice('Microphone access unavailable. Please type your search.');
      setTimeout(() => setVoiceNotice(null), 3500);
    }
  };

  const handleSelectQuery = (term: string) => {
    setSearchQuery(term);
    saveRecentSearch(term);
    setIsOpen(true);
  };

  const handleClear = () => {
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchQuery.trim()) {
        saveRecentSearch(searchQuery.trim());
      }
      setIsOpen(false);
    }
  };

  // Matching calculations with intelligent tokenization and synonyms
  const { matchingRestaurants, matchingDishes, smartSuggestions } = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return { matchingRestaurants: [], matchingDishes: [], smartSuggestions: [] };
    }

    const tokens = q.split(/\s+/).filter(Boolean);

    // Identify intent synonyms
    const isVegQuery = q.includes('veg') || q.includes('paneer') || q.includes('salad') || q.includes('dal') || q.includes('sabzi');
    const isNonVegQuery = q.includes('chicken') || q.includes('mutton') || q.includes('fish') || q.includes('egg') || q.includes('meat') || q.includes('prawn');

    const matchedRests = restaurants.filter((r) => {
      if (r.status !== 'approved') return false;
      const restName = r.name.toLowerCase();
      const restCuisines = r.cuisine.map((c) => c.toLowerCase());
      const restAddress = (r.address || '').toLowerCase();

      // Check if all tokens match or if exact string matches
      const allTokensMatch = tokens.every(
        (t) =>
          restName.includes(t) ||
          restCuisines.some((c) => c.includes(t)) ||
          restAddress.includes(t)
      );

      const dishMatch = menuItems.some(
        (m) =>
          m.restaurantId === r.id &&
          tokens.some(
            (t) =>
              m.name.toLowerCase().includes(t) ||
              m.category?.toLowerCase().includes(t) ||
              m.description?.toLowerCase().includes(t)
          )
      );

      return allTokensMatch || dishMatch;
    });

    const matchedItems = menuItems
      .filter((m) => {
        if (m.isAvailable === false) return false;
        const nameLower = m.name.toLowerCase();
        const descLower = (m.description || '').toLowerCase();
        const catLower = (m.category || '').toLowerCase();
        const variantNames = (m.variants || []).map((v) => v.name.toLowerCase());

        // Token match: either full phrase matches or tokens match
        const phraseMatch = nameLower.includes(q) || descLower.includes(q) || catLower.includes(q);
        const tokenMatch = tokens.every(
          (t) =>
            nameLower.includes(t) ||
            descLower.includes(t) ||
            catLower.includes(t) ||
            variantNames.some((vn) => vn.includes(t))
        );

        // Dietary intent
        if (isVegQuery && !m.isVeg) return false;
        if (isNonVegQuery && m.isVeg) return false;

        return phraseMatch || tokenMatch;
      })
      .map((m) => {
        const rest = restaurants.find((r) => r.id === m.restaurantId);
        return {
          ...m,
          restaurantName: rest?.name || 'Restaurant Partner',
          restaurantAddress: rest?.address || '',
          restaurantRating: rest?.rating || 4.5,
          restaurantZoneId: rest?.zoneId || '',
          deliveryTimeMins: rest?.deliveryTimeMins || 25,
        };
      });

    // Generate quick suggestions
    const suggestionSet = new Set<string>();
    matchedItems.slice(0, 4).forEach((item) => suggestionSet.add(item.name));
    matchedRests.slice(0, 3).forEach((r) => suggestionSet.add(r.name));

    return {
      matchingRestaurants: matchedRests,
      matchingDishes: matchedItems,
      smartSuggestions: Array.from(suggestionSet).slice(0, 5),
    };
  }, [searchQuery, restaurants, menuItems]);

  // Tab & Filter applied lists
  const displayDishes = useMemo(() => {
    if (activeTab === 'restaurants') return [];
    let list = matchingDishes;

    if (activeTab === 'veg') {
      list = list.filter((d) => d.isVeg);
    }

    // Price Filter
    if (priceFilter === 'under150') {
      list = list.filter((d) => d.price <= 150);
    } else if (priceFilter === '150to300') {
      list = list.filter((d) => d.price > 150 && d.price <= 300);
    } else if (priceFilter === 'above300') {
      list = list.filter((d) => d.price > 300);
    }

    // Sorting
    return [...list].sort((a, b) => {
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || b.restaurantRating || 4.5) - (a.rating || a.restaurantRating || 4.5);
      // relevance: prioritize bestsellers & name matches
      const aExact = a.name.toLowerCase().includes(searchQuery.toLowerCase());
      const bExact = b.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      if (a.isBestseller && !b.isBestseller) return -1;
      if (!a.isBestseller && b.isBestseller) return 1;
      return 0;
    });
  }, [matchingDishes, activeTab, priceFilter, sortBy, searchQuery]);

  const displayRestaurants = useMemo(() => {
    if (activeTab === 'dishes') return [];
    let list = matchingRestaurants;
    if (activeTab === 'veg') {
      list = list.filter((r) => r.pureVeg);
    }
    return list;
  }, [matchingRestaurants, activeTab]);

  const matchingGroceries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    return (martProducts || []).filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(q);
      const brandMatch = item.brand.toLowerCase().includes(q);
      const catMatch = item.category.toLowerCase().includes(q);
      const descMatch = (item.description || '').toLowerCase().includes(q);
      return nameMatch || brandMatch || catMatch || descMatch;
    }).slice(0, 4);
  }, [searchQuery, martProducts]);

  const handleOpenRestaurant = (restaurantId: string) => {
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
    }
    setSelectedRestaurantId(restaurantId);
    setCustomerView('restaurant_detail');
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddDishToCart = (e: React.MouseEvent, item: MenuItem) => {
    e.stopPropagation();
    addToCart(item);
    setAddedItemAnimId(item.id);
    setTimeout(() => setAddedItemAnimId(null), 1200);
    addNotification('Added to Cart', `Added 1x ${item.name} to your food basket!`, 'order');
  };

  // Helper: Highlight query substring
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-orange-200 text-orange-950 font-black rounded-xs px-0.5">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input Bar */}
      <div
        className={`relative flex items-center transition-all duration-200 rounded-2xl bg-white border ${
          isOpen
            ? 'ring-3 ring-orange-500/20 border-orange-500 shadow-md'
            : 'border-slate-200/90 shadow-2xs hover:border-slate-300'
        }`}
      >
        <Search
          className={`w-4 h-4 ml-3.5 shrink-0 transition-colors ${
            isOpen ? 'text-orange-500' : 'text-slate-400'
          }`}
        />

        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDownInput}
          placeholder={ROTATING_PLACEHOLDERS[placeholderIndex]}
          className="w-full text-xs sm:text-[13px] py-2.5 pl-2.5 pr-20 bg-transparent text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none"
        />

        {/* Right Action Icons: Clear, Voice Mic, and Keyboard Shortcut */}
        <div className="absolute right-2.5 flex items-center gap-1">
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
              title="Clear search query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Voice Search Button */}
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`p-1.5 rounded-xl transition flex items-center justify-center ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-xs ring-2 ring-rose-400/50'
                : 'text-slate-400 hover:text-orange-600 hover:bg-orange-50'
            }`}
            title="Search by voice"
          >
            {isListening ? <Mic className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>

          {/* Keyboard shortcut hint (desktop only) */}
          {!isMobile && !searchQuery && (
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold text-slate-400 bg-slate-100 border border-slate-200/80 rounded-md">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </kbd>
          )}
        </div>
      </div>

      {/* Voice feedback banner */}
      {voiceNotice && (
        <div className="absolute top-full left-0 right-0 mt-1.5 p-2.5 bg-slate-900 text-white text-xs rounded-xl shadow-lg z-50 flex items-center gap-2 animate-in fade-in">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
          <span className="flex-1 font-medium">{voiceNotice}</span>
          <button
            type="button"
            onClick={() => setVoiceNotice(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Interactive Autocomplete Dropdown Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl border border-slate-200/90 shadow-2xl z-50 overflow-hidden max-h-[80vh] sm:max-h-[580px] flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header Summary / Tab Controls */}
          {searchQuery.trim() ? (
            <>
              <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                      activeTab === 'all'
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/80'
                    }`}
                  >
                    All ({matchingDishes.length + matchingRestaurants.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('dishes')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 ${
                      activeTab === 'dishes'
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/80'
                    }`}
                  >
                    <UtensilsCrossed className="w-3 h-3" />
                    <span>Dishes ({matchingDishes.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('restaurants')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 ${
                      activeTab === 'restaurants'
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/80'
                    }`}
                  >
                    <Store className="w-3 h-3" />
                    <span>Restaurants ({matchingRestaurants.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('veg')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 ${
                      activeTab === 'veg'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>Pure Veg Only</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCustomerView('quick_commerce');
                      setIsOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 active:scale-95 shrink-0"
                    title="Switch to 10-minute grocery & daily essentials delivery"
                  >
                    <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>Groceries (10m)</span>
                  </button>
                </div>

                <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">
                  Press Enter to view on page
                </span>
              </div>

              {/* Quick Price & Sort Filter Bar */}
              <div className="px-3 py-2 bg-white border-b border-slate-100 flex items-center justify-between gap-2 flex-wrap text-xs">
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price:</span>
                  <button
                    type="button"
                    onClick={() => setPriceFilter('all')}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition ${
                      priceFilter === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriceFilter('under150')}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition ${
                      priceFilter === 'under150'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Under ₹150
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriceFilter('150to300')}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition ${
                      priceFilter === '150to300'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    ₹150 - ₹300
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriceFilter('above300')}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition ${
                      priceFilter === 'above300'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    ₹300+
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-[11px] font-bold bg-slate-100 hover:bg-slate-200 border-none rounded-lg px-2 py-0.5 text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="relevance">Top Match</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>
            </>
          ) : null}

          {/* Body Content */}
          <div className="overflow-y-auto p-4 space-y-5 flex-1 divide-y divide-slate-100">
            {/* 1. When Search Input is Empty */}
            {!searchQuery.trim() && (
              <div className="space-y-5">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 text-[10px]">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Recent Searches</span>
                      </span>
                      <button
                        type="button"
                        onClick={clearAllRecentSearches}
                        className="text-[11px] font-bold text-slate-400 hover:text-rose-600 transition flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear All</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term) => (
                        <div
                          key={term}
                          onClick={() => handleSelectQuery(term)}
                          className="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-orange-50 hover:text-orange-900 border border-slate-200/80 hover:border-orange-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition active:scale-95 shadow-2xs"
                        >
                          <Clock className="w-3 h-3 text-slate-400 group-hover:text-orange-500" />
                          <span>{term}</span>
                          <button
                            type="button"
                            onClick={(e) => removeRecentSearch(e, term)}
                            className="p-0.5 text-slate-400 hover:text-rose-600 rounded-md transition"
                            title="Remove"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending & Popular Food Searches */}
                <div className="space-y-2.5 pt-4">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-black uppercase tracking-wider text-slate-400 flex items-center gap-1 text-[10px]">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      <span>Popular & Trending Food</span>
                    </span>
                    <span className="text-[10px] bg-orange-100 text-orange-800 font-black px-1.5 py-0.2 rounded-full">
                      HOT
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {TRENDING_SEARCHES.map((item) => (
                      <button
                        key={item.term}
                        type="button"
                        onClick={() => handleSelectQuery(item.term)}
                        className="px-3 py-2 bg-gradient-to-r from-orange-50/70 to-amber-50/70 hover:from-orange-100 hover:to-amber-100 text-slate-800 border border-orange-200/90 rounded-2xl text-xs font-bold transition active:scale-95 shadow-2xs flex items-center gap-1.5"
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Cuisine Explorer */}
                <div className="space-y-2.5 pt-4">
                  <span className="font-black uppercase tracking-wider text-slate-400 flex items-center gap-1 text-[10px]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Explore by Cuisines</span>
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { name: 'North Indian', icon: '🥘' },
                      { name: 'South Indian', icon: '🥞' },
                      { name: 'Chinese & Asian', icon: '🥢' },
                      { name: 'Italian & Pizza', icon: '🍕' },
                    ].map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => handleSelectQuery(c.name)}
                        className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-2xl text-xs font-black border border-slate-200 text-left transition flex items-center gap-2"
                      >
                        <span className="text-base">{c.icon}</span>
                        <span className="truncate">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. When Search Input has Query */}
            {searchQuery.trim() && (
              <div className="space-y-5 pt-1">
                {/* Section: Likart Mart Quick-Commerce Groceries */}
                {matchingGroceries.length > 0 && (
                  <div className="p-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-2xl border border-emerald-200/90 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-lg bg-emerald-600 text-white">
                          <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                        </span>
                        <div>
                          <span className="text-xs font-black text-emerald-950 block leading-tight">
                            Likart Mart (10-Min Delivery)
                          </span>
                          <span className="text-[10px] text-emerald-700 font-semibold">
                            Dispatched from central dark store in minutes
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomerView('quick_commerce');
                          setIsOpen(false);
                        }}
                        className="text-xs font-black text-emerald-800 hover:text-emerald-950 flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-emerald-300 shadow-2xs transition active:scale-95"
                      >
                        <span>Open Mart</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {matchingGroceries.map((qc) => {
                        const inCartItem = cart.find((c) => c.item?.id === qc.id);
                        const qty = inCartItem?.quantity || 0;
                        return (
                          <div
                            key={qc.id}
                            className="flex items-center justify-between p-2 bg-white rounded-xl border border-emerald-200/80 shadow-2xs gap-2"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={qc.image}
                                alt={qc.name}
                                className="w-10 h-10 rounded-lg object-cover border border-slate-100 shrink-0"
                              />
                              <div className="min-w-0">
                                <h5 className="text-xs font-bold text-slate-900 truncate">
                                  {qc.name}
                                </h5>
                                <p className="text-[10px] text-slate-500">
                                  {qc.unit} • ₹{qc.price}
                                </p>
                              </div>
                            </div>
                            <div className="shrink-0">
                              {qty > 0 ? (
                                <div className="flex items-center gap-1.5 bg-emerald-600 text-white rounded-lg px-2 py-0.5 text-xs font-black">
                                  <button
                                    type="button"
                                    onClick={() => updateCartQuantity(qc.id, -1)}
                                    className="p-0.5 hover:bg-emerald-700 rounded transition"
                                    title="Decrease"
                                  >
                                    <Minus className="w-2.5 h-2.5" />
                                  </button>
                                  <span>{qty}</span>
                                  <button
                                    type="button"
                                    onClick={() => updateCartQuantity(qc.id, 1)}
                                    className="p-0.5 hover:bg-emerald-700 rounded transition"
                                    title="Increase"
                                  >
                                    <Plus className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    addToCart(quickCommerceItemToMenuItem(qc));
                                    addNotification('Added to Basket', `1x ${qc.name} for 10-minute dispatch.`, 'order');
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black rounded-lg transition active:scale-95 shadow-2xs"
                                >
                                  ADD
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* No Matches Found */}
                {displayDishes.length === 0 && displayRestaurants.length === 0 && matchingGroceries.length === 0 ? (
                  <div className="py-10 text-center space-y-3">
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto">
                      <Search className="w-6 h-6" />
                    </div>
                    <h4 className="font-heading font-black text-slate-900 text-sm">
                      No direct matches found for "{searchQuery}"
                    </h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Try searching for popular dishes like Biryani, Pizza, Paneer, Momos, or groceries like Milk, Bread, Tomatoes.
                    </p>
                    <div className="flex justify-center gap-2 pt-1 flex-wrap">
                      {['Biryani', 'Pizza', 'Burger', 'Milk', 'Eggs'].map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleSelectQuery(suggestion)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-700 text-xs font-bold rounded-lg border border-slate-200"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Section A: Matching Food Items / Dishes */}
                {displayDishes.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black uppercase tracking-wider text-slate-400 text-[10px] flex items-center gap-1.5">
                        <UtensilsCrossed className="w-3.5 h-3.5 text-orange-500" />
                        <span>Matching Dishes ({displayDishes.length})</span>
                      </span>
                      <span className="text-[11px] font-bold text-orange-600">
                        Add directly to cart
                      </span>
                    </div>

                    <div className="space-y-2">
                      {displayDishes.slice(0, 8).map((item) => {
                        const inCartItem = cart.find((c) => c.item?.id === item.id);
                        const qty = inCartItem?.quantity || 0;

                        return (
                          <div
                            key={item.id}
                            onClick={() => handleOpenRestaurant(item.restaurantId)}
                            className="p-2.5 sm:p-3 rounded-2xl border border-slate-200/90 hover:border-orange-300 hover:bg-orange-50/40 transition flex items-center justify-between gap-3 cursor-pointer group shadow-2xs"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Dish Image */}
                              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <div className="absolute top-1 left-1 bg-white/90 p-0.5 rounded-sm">
                                  <span
                                    className={`block w-2.5 h-2.5 rounded-full ${
                                      item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                                    }`}
                                  />
                                </div>
                              </div>

                              {/* Details */}
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-orange-600 transition truncate">
                                    {highlightMatch(item.name, searchQuery)}
                                  </h4>
                                  {item.isBestseller && (
                                    <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded-md">
                                      BESTSELLER
                                    </span>
                                  )}
                                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                                    ★ {item.rating || 4.5}
                                  </span>
                                </div>

                                <p className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
                                  <span>From</span>
                                  <span className="font-semibold text-slate-700">
                                    {item.restaurantName}
                                  </span>
                                  <span className="text-slate-300">•</span>
                                  <span>{item.deliveryTimeMins || 25} mins</span>
                                </p>

                                <div className="flex items-center gap-2 mt-1">
                                  <span className="font-black text-xs text-slate-900">
                                    ₹{item.price}
                                  </span>
                                  {item.originalPrice && item.originalPrice > item.price && (
                                    <span className="text-[10px] text-slate-400 line-through">
                                      ₹{item.originalPrice}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Direct Add to Cart Action */}
                            <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                              {qty > 0 ? (
                                <div className="flex items-center gap-2 bg-orange-600 text-white rounded-xl px-2 py-1 shadow-xs">
                                  <button
                                    type="button"
                                    onClick={() => updateCartQuantity(item.id, -1)}
                                    className="p-0.5 hover:bg-orange-700 rounded-md transition"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="text-xs font-black min-w-[14px] text-center">
                                    {qty}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => updateCartQuantity(item.id, 1)}
                                    className="p-0.5 hover:bg-orange-700 rounded-md transition"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => handleAddDishToCart(e, item)}
                                  className={`px-3 py-1.5 rounded-xl font-black text-xs transition active:scale-95 shadow-xs flex items-center gap-1 ${
                                    addedItemAnimId === item.id
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-white hover:bg-orange-600 text-orange-600 hover:text-white border border-orange-300 hover:border-orange-600'
                                  }`}
                                >
                                  {addedItemAnimId === item.id ? (
                                    <>
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Added</span>
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>ADD</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Section B: Matching Restaurants */}
                {displayRestaurants.length > 0 && (
                  <div className="space-y-3 pt-4">
                    <span className="font-black uppercase tracking-wider text-slate-400 text-[10px] flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-blue-500" />
                      <span>Matching Restaurants ({displayRestaurants.length})</span>
                    </span>

                    <div className="space-y-2">
                      {displayRestaurants.slice(0, 4).map((rest) => (
                        <div
                          key={rest.id}
                          onClick={() => handleOpenRestaurant(rest.id)}
                          className="p-2.5 sm:p-3 rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:bg-blue-50/40 transition flex items-center justify-between gap-3 cursor-pointer group shadow-2xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={rest.bannerImage}
                              alt={rest.name}
                              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover shrink-0 border border-slate-200/80 group-hover:scale-105 transition-transform"
                            />

                            <div className="min-w-0">
                              <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-700 transition truncate">
                                {highlightMatch(rest.name, searchQuery)}
                              </h4>
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                {rest.cuisine.join(' • ')}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 mt-1">
                                <span className="flex items-center gap-0.5 text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                                  <Star className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600" />
                                  <span>{rest.rating}</span>
                                </span>
                                <span>• {rest.deliveryTimeMins} mins</span>
                                {rest.pureVeg && (
                                  <span className="text-emerald-700 bg-emerald-100/70 px-1 rounded font-black">
                                    PURE VEG
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center text-slate-400 group-hover:text-blue-600 transition">
                            <span className="text-xs font-bold mr-1 hidden sm:inline">View Menu</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Bar */}
          {searchQuery.trim() && (
            <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-bold">
              <span>
                Found {matchingDishes.length} dishes & {matchingRestaurants.length} restaurants
              </span>
              <button
                type="button"
                onClick={() => {
                  saveRecentSearch(searchQuery.trim());
                  setIsOpen(false);
                }}
                className="text-orange-600 hover:text-orange-700 hover:underline font-black flex items-center gap-1"
              >
                <span>Browse All on Page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
