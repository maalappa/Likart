import React, { useState } from 'react';
import {
  SlidersHorizontal,
  ChevronDown,
  Star,
  Clock,
  Tag,
  X,
  Check,
  RotateCcw,
  Sparkles,
  Flame,
  ArrowUpDown,
  DollarSign,
  UtensilsCrossed,
  MapPin,
  Compass,
} from 'lucide-react';

export interface FilterState {
  sortBy: 'relevance' | 'rating' | 'delivery_time' | 'cost_low' | 'cost_high';
  minRating: number; // 0 (any), 4.0, 4.5
  maxDeliveryTime: number; // 0 (any), 25, 35
  costRange: 'all' | 'under300' | '300to600' | 'above600';
  pureVeg: boolean;
  offersOnly: boolean;
  openOnly: boolean;
  underZoneOnly: boolean;
}

export const DEFAULT_FILTERS: FilterState = {
  sortBy: 'relevance',
  minRating: 0,
  maxDeliveryTime: 0,
  costRange: 'all',
  pureVeg: false,
  offersOnly: false,
  openOnly: false,
  underZoneOnly: true,
};

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  totalResultsCount: number;
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  totalResultsCount,
  onResetFilters,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<
    'sort' | 'dietary' | 'time' | 'rating' | 'cost' | 'more'
  >('sort');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Draft filters for modal
  const [draftFilters, setDraftFilters] = useState<FilterState>(filters);

  const openModal = () => {
    setDraftFilters(filters);
    setIsModalOpen(true);
  };

  const applyDraftFilters = () => {
    onFilterChange(draftFilters);
    setIsModalOpen(false);
  };

  // Calculate active filter count (excluding default underZoneOnly: true and sortBy: 'relevance')
  const activeCount =
    (filters.sortBy !== 'relevance' ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.maxDeliveryTime > 0 ? 1 : 0) +
    (filters.costRange !== 'all' ? 1 : 0) +
    (filters.pureVeg ? 1 : 0) +
    (filters.offersOnly ? 1 : 0) +
    (filters.openOnly ? 1 : 0) +
    (!filters.underZoneOnly ? 1 : 0);

  const sortLabels: Record<FilterState['sortBy'], string> = {
    relevance: 'Relevance (Default)',
    rating: 'Rating: High to Low',
    delivery_time: 'Delivery Time: Fastest First',
    cost_low: 'Cost: Low to High',
    cost_high: 'Cost: High to Low',
  };

  return (
    <div className="space-y-3">
      {/* 1. Quick Filters Horizontal Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:p-3.5 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5 w-full lg:w-auto">
          {/* Main "All Filters" Modal Trigger Button */}
          <button
            type="button"
            onClick={openModal}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 shrink-0 shadow-2xs border ${
              activeCount > 0
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-[10px] font-black flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>

          {/* Sort Dropdown Pill */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              className={`px-3 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 border shadow-2xs ${
                filters.sortBy !== 'relevance'
                  ? 'bg-orange-50 text-orange-950 border-orange-300 font-black'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span>Sort: {sortLabels[filters.sortBy].split(':')[0]}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isSortDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsSortDropdownOpen(false)}
                />
                <div className="absolute top-full left-0 mt-1.5 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 py-1.5 text-xs animate-in fade-in duration-100">
                  <div className="px-3 py-1 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                    Sort Restaurants By
                  </div>
                  {(Object.keys(sortLabels) as FilterState['sortBy'][]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        onFilterChange({ ...filters, sortBy: key });
                        setIsSortDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 font-bold flex items-center justify-between hover:bg-orange-50/70 transition ${
                        filters.sortBy === key
                          ? 'text-orange-600 bg-orange-50/50 font-black'
                          : 'text-slate-700'
                      }`}
                    >
                      <span>{sortLabels[key]}</span>
                      {filters.sortBy === key && (
                        <Check className="w-3.5 h-3.5 text-orange-600" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Quick Toggle: Pure Veg */}
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, pureVeg: !filters.pureVeg })}
            className={`px-3 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 border shadow-2xs ${
              filters.pureVeg
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                filters.pureVeg ? 'bg-white' : 'bg-emerald-600'
              }`}
            />
            <span>Pure Veg</span>
          </button>

          {/* Quick Toggle: Rating 4.0+ */}
          <button
            type="button"
            onClick={() =>
              onFilterChange({
                ...filters,
                minRating: filters.minRating === 4.0 ? 0 : 4.0,
              })
            }
            className={`px-3 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 border shadow-2xs ${
              filters.minRating === 4.0
                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 ${
                filters.minRating === 4.0 ? 'fill-white' : 'fill-amber-400 text-amber-500'
              }`}
            />
            <span>Rating 4.0+</span>
          </button>

          {/* Quick Toggle: Fast Delivery < 25 mins */}
          <button
            type="button"
            onClick={() =>
              onFilterChange({
                ...filters,
                maxDeliveryTime: filters.maxDeliveryTime === 25 ? 0 : 25,
              })
            }
            className={`px-3 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 border shadow-2xs ${
              filters.maxDeliveryTime === 25
                ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Fast Delivery (&lt;25m)</span>
          </button>

          {/* Quick Toggle: Offers & Deals */}
          <button
            type="button"
            onClick={() =>
              onFilterChange({ ...filters, offersOnly: !filters.offersOnly })
            }
            className={`px-3 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 border shadow-2xs ${
              filters.offersOnly
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Offers &amp; Deals</span>
          </button>

          {/* Quick Toggle: Cost Under ₹300 */}
          <button
            type="button"
            onClick={() =>
              onFilterChange({
                ...filters,
                costRange: filters.costRange === 'under300' ? 'all' : 'under300',
              })
            }
            className={`px-3 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 border shadow-2xs ${
              filters.costRange === 'under300'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Under ₹300</span>
          </button>

          {/* Quick Toggle: Open Kitchens Only */}
          <button
            type="button"
            onClick={() =>
              onFilterChange({ ...filters, openOnly: !filters.openOnly })
            }
            className={`px-3 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 border shadow-2xs ${
              filters.openOnly
                ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                filters.openOnly ? 'bg-white animate-pulse' : 'bg-emerald-500'
              }`}
            />
            <span>Open Now</span>
          </button>
        </div>

        {/* Results Counter / Clear All shortcut */}
        <div className="flex items-center gap-3 shrink-0 ml-auto text-xs">
          <span className="text-slate-500 font-semibold">
            <span className="font-black text-slate-900">{totalResultsCount}</span>{' '}
            outlets found
          </span>

          {activeCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-orange-600 hover:text-orange-700 font-black hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Active Filter Tags Strip (Shows if active filters present) */}
      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs animate-in fade-in">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            Active Filters:
          </span>

          {filters.sortBy !== 'relevance' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-100/80 text-orange-900 font-bold border border-orange-200">
              <span>Sort: {sortLabels[filters.sortBy]}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, sortBy: 'relevance' })}
                className="hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.pureVeg && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-900 font-bold border border-emerald-200">
              <span>🌱 Pure Veg Only</span>
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, pureVeg: false })}
                className="hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.minRating > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 font-bold border border-amber-200">
              <span>★ Rating {filters.minRating}+</span>
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, minRating: 0 })}
                className="hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.maxDeliveryTime > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-100 text-orange-900 font-bold border border-orange-200">
              <span>⚡ Under {filters.maxDeliveryTime} mins</span>
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, maxDeliveryTime: 0 })}
                className="hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.costRange !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-100 text-blue-900 font-bold border border-blue-200">
              <span>
                🪙{' '}
                {filters.costRange === 'under300'
                  ? 'Cost < ₹300'
                  : filters.costRange === '300to600'
                  ? 'Cost ₹300-₹600'
                  : 'Cost > ₹600'}
              </span>
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, costRange: 'all' })}
                className="hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.offersOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-100 text-rose-900 font-bold border border-rose-200">
              <span>🏷️ Offers &amp; Discounts</span>
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, offersOnly: false })}
                className="hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.openOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-teal-100 text-teal-900 font-bold border border-teal-200">
              <span>🟢 Open Now</span>
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, openOnly: false })}
                className="hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {!filters.underZoneOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-100 text-purple-900 font-bold border border-purple-200">
              <span>🌐 All Delivery Radius</span>
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, underZoneOnly: true })}
                className="hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={onResetFilters}
            className="text-[11px] font-black text-rose-600 hover:text-rose-700 hover:underline ml-1"
          >
            Clear All
          </button>
        </div>
      )}

      {/* 3. Comprehensive Filter Modal / Drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-black text-slate-900">
                    Filter &amp; Sort Restaurants
                  </h3>
                  <p className="text-xs text-slate-500">
                    Customize your preferences for food discovery
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Two-Pane Content */}
            <div className="flex-1 flex overflow-hidden min-h-[380px]">
              {/* Left Vertical Tabs */}
              <div className="w-1/3 sm:w-2/5 border-r border-slate-100 bg-slate-50/70 p-2 space-y-1 overflow-y-auto">
                {[
                  { id: 'sort', label: 'Sort By', icon: ArrowUpDown },
                  { id: 'dietary', label: 'Dietary Preference', icon: UtensilsCrossed },
                  { id: 'time', label: 'Delivery Time', icon: Clock },
                  { id: 'rating', label: 'Ratings', icon: Star },
                  { id: 'cost', label: 'Cost for Two', icon: DollarSign },
                  { id: 'more', label: 'Special & Location', icon: Tag },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeModalTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveModalTab(tab.id as any)}
                      className={`w-full text-left p-3 rounded-2xl font-bold text-xs flex items-center justify-between transition ${
                        isActive
                          ? 'bg-white text-orange-600 shadow-xs border border-slate-200/80 font-black'
                          : 'text-slate-600 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{tab.label}</span>
                      </div>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-orange-600" />}
                    </button>
                  );
                })}
              </div>

              {/* Right Options Details Pane */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                {/* 1. Sort Options */}
                {activeModalTab === 'sort' && (
                  <div className="space-y-3">
                    <h4 className="font-heading font-black text-sm text-slate-900">
                      Sort Outlets By
                    </h4>
                    <div className="space-y-2">
                      {(Object.keys(sortLabels) as FilterState['sortBy'][]).map((key) => (
                        <label
                          key={key}
                          onClick={() => setDraftFilters({ ...draftFilters, sortBy: key })}
                          className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                            draftFilters.sortBy === key
                              ? 'border-orange-500 bg-orange-50/40 text-orange-950 font-black'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="text-xs font-bold">{sortLabels[key]}</span>
                          <input
                            type="radio"
                            name="sortBy"
                            checked={draftFilters.sortBy === key}
                            onChange={() => {}}
                            className="text-orange-600 focus:ring-orange-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Dietary Preference */}
                {activeModalTab === 'dietary' && (
                  <div className="space-y-4">
                    <h4 className="font-heading font-black text-sm text-slate-900">
                      Dietary Preferences
                    </h4>
                    <div className="grid grid-cols-1 gap-2.5">
                      <label
                        onClick={() =>
                          setDraftFilters({ ...draftFilters, pureVeg: false })
                        }
                        className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                          !draftFilters.pureVeg
                            ? 'border-orange-500 bg-orange-50/40 font-black text-orange-950'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-bold block">All Restaurants</span>
                          <span className="text-[11px] text-slate-500">
                            Show veg, non-veg, and multi-cuisine kitchens
                          </span>
                        </div>
                        <input
                          type="radio"
                          name="dietary"
                          checked={!draftFilters.pureVeg}
                          onChange={() => {}}
                          className="text-orange-600"
                        />
                      </label>

                      <label
                        onClick={() =>
                          setDraftFilters({ ...draftFilters, pureVeg: true })
                        }
                        className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                          draftFilters.pureVeg
                            ? 'border-emerald-500 bg-emerald-50/50 font-black text-emerald-950'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-bold text-emerald-700 block flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-600" />
                            <span>100% Pure Veg Outlets Only</span>
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Strictly vegetarian certified restaurants
                          </span>
                        </div>
                        <input
                          type="radio"
                          name="dietary"
                          checked={draftFilters.pureVeg}
                          onChange={() => {}}
                          className="text-emerald-600"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* 3. Delivery Time */}
                {activeModalTab === 'time' && (
                  <div className="space-y-3">
                    <h4 className="font-heading font-black text-sm text-slate-900">
                      Estimated Delivery Speed
                    </h4>
                    <div className="space-y-2">
                      {[
                        { val: 0, label: 'Any Delivery Time' },
                        { val: 25, label: 'Lightning Fast (Under 25 mins) ⚡' },
                        { val: 35, label: 'Fast Delivery (Under 35 mins) ⏱️' },
                      ].map((t) => (
                        <label
                          key={t.val}
                          onClick={() =>
                            setDraftFilters({ ...draftFilters, maxDeliveryTime: t.val })
                          }
                          className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                            draftFilters.maxDeliveryTime === t.val
                              ? 'border-orange-500 bg-orange-50/40 text-orange-950 font-black'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="text-xs font-bold">{t.label}</span>
                          <input
                            type="radio"
                            name="maxTime"
                            checked={draftFilters.maxDeliveryTime === t.val}
                            onChange={() => {}}
                            className="text-orange-600"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Ratings */}
                {activeModalTab === 'rating' && (
                  <div className="space-y-3">
                    <h4 className="font-heading font-black text-sm text-slate-900">
                      Minimum Customer Rating
                    </h4>
                    <div className="space-y-2">
                      {[
                        { val: 0, label: 'All Ratings' },
                        { val: 4.0, label: 'Rating 4.0+ Stars ★' },
                        { val: 4.5, label: 'Rating 4.5+ Stars (Top Rated) ★★★' },
                      ].map((r) => (
                        <label
                          key={r.val}
                          onClick={() =>
                            setDraftFilters({ ...draftFilters, minRating: r.val })
                          }
                          className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                            draftFilters.minRating === r.val
                              ? 'border-amber-500 bg-amber-50/40 text-amber-950 font-black'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="text-xs font-bold">{r.label}</span>
                          <input
                            type="radio"
                            name="rating"
                            checked={draftFilters.minRating === r.val}
                            onChange={() => {}}
                            className="text-amber-600"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Cost for Two */}
                {activeModalTab === 'cost' && (
                  <div className="space-y-3">
                    <h4 className="font-heading font-black text-sm text-slate-900">
                      Budget &amp; Cost for Two
                    </h4>
                    <div className="space-y-2">
                      {[
                        { val: 'all', label: 'All Price Ranges' },
                        { val: 'under300', label: 'Pocket Friendly (Less than ₹300 for two)' },
                        { val: '300to600', label: 'Mid-Range (₹300 - ₹600 for two)' },
                        { val: 'above600', label: 'Premium Dining (Above ₹600 for two)' },
                      ].map((c) => (
                        <label
                          key={c.val}
                          onClick={() =>
                            setDraftFilters({ ...draftFilters, costRange: c.val as any })
                          }
                          className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                            draftFilters.costRange === c.val
                              ? 'border-blue-500 bg-blue-50/40 text-blue-950 font-black'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="text-xs font-bold">{c.label}</span>
                          <input
                            type="radio"
                            name="costRange"
                            checked={draftFilters.costRange === c.val}
                            onChange={() => {}}
                            className="text-blue-600"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Special & Location */}
                {activeModalTab === 'more' && (
                  <div className="space-y-3">
                    <h4 className="font-heading font-black text-sm text-slate-900">
                      Special Features &amp; Location
                    </h4>
                    <div className="space-y-2.5">
                      <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">
                            Offers &amp; Deals
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Restaurants running coupons, percentage discounts &amp; flat deals
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={draftFilters.offersOnly}
                          onChange={(e) =>
                            setDraftFilters({
                              ...draftFilters,
                              offersOnly: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-orange-600 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">
                            Open Kitchens Only
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Filter out outlets currently closed for ordering
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={draftFilters.openOnly}
                          onChange={(e) =>
                            setDraftFilters({
                              ...draftFilters,
                              openOnly: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-orange-600 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">
                            Zone-Only Ordering
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Only show restaurants operating inside your auto-fetched GPS delivery zone
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={draftFilters.underZoneOnly}
                          onChange={(e) =>
                            setDraftFilters({
                              ...draftFilters,
                              underZoneOnly: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-orange-600 rounded"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setDraftFilters(DEFAULT_FILTERS)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default</span>
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyDraftFilters}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-black shadow-md transition active:scale-95 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply Filters</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
