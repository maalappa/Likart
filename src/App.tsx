import React, { useState, useMemo } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { LocationModal } from './components/common/LocationModal';
import { AuthModal } from './components/common/AuthModal';
import { HeroBanners } from './components/customer/HeroBanners';
import { CategoryBar } from './components/customer/CategoryBar';
import { RestaurantCard } from './components/customer/RestaurantCard';
import { RestaurantDetail } from './components/customer/RestaurantDetail';
import { CartDrawer } from './components/customer/CartDrawer';
import { CheckoutModal } from './components/customer/CheckoutModal';
import { OrderTrackingModal } from './components/customer/OrderTrackingModal';
import { CustomerProfile } from './components/customer/CustomerProfile';
import { SupportModal } from './components/customer/SupportModal';
import { FilterBar, FilterState, DEFAULT_FILTERS } from './components/customer/FilterBar';
import { checkRestaurantOpenStatus } from './utils/timeUtils';
import { PolicyPages } from './components/legal/PolicyPages';
import { QuickCommerceView } from './components/customer/QuickCommerceView';
import { RestaurantLogin } from './components/restaurant/RestaurantLogin';
import { RestaurantOnboarding } from './components/restaurant/RestaurantOnboarding';
import { RestaurantDashboard } from './components/restaurant/RestaurantDashboard';
import { DeliveryLogin } from './components/delivery/DeliveryLogin';
import { DeliveryOnboarding } from './components/delivery/DeliveryOnboarding';
import { DeliveryDashboard } from './components/delivery/DeliveryDashboard';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { MartSuperAdminDashboard } from './components/admin/MartSuperAdminDashboard';
import { MartManagerLogin } from './components/mart/MartManagerLogin';
import { MartManagerDashboard } from './components/mart/MartManagerDashboard';
import { WebsiteUniversalAccessModal } from './components/common/WebsiteUniversalAccessModal';
import {
  SlidersHorizontal,
  Star,
  Clock,
  Store,
  Bike,
  MapPin,
  Navigation,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Search,
  UtensilsCrossed,
  Sparkles,
  Plus,
  Minus,
  X,
  Check,
  Zap,
  Smartphone,
} from 'lucide-react';
import { calculateDistanceKm } from './utils/geoUtils';

const MainContent: React.FC = () => {
  const {
    activePortal,
    setActivePortal,
    customerView,
    setCustomerView,
    selectedRestaurantId,
    setSelectedRestaurantId,
    restaurants,
    currentLocation,
    currentZone,
    detectUserLocation,
    setIsLocationModalOpen,
    authRestaurant,
    authRider,
    authAdmin,
    adminInitialTab,
    authMartManager,
    cuisines,
    menuItems,
    cart,
    addToCart,
    addNotification,
    setIsCartOpen,
    isBrowseOnOtherDevicesModalOpen,
    setIsBrowseOnOtherDevicesModalOpen,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [quickCommerceCategory, setQuickCommerceCategory] = useState('all');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // Sub-view toggles for onboarding vs login
  const [restaurantSubView, setRestaurantSubView] = useState<'login' | 'onboarding'>('login');
  const [deliverySubView, setDeliverySubView] = useState<'login' | 'onboarding'>('login');

  // Filter and sort restaurants for customer browsing
  const filteredRestaurants = useMemo(() => {
    const list = restaurants.filter((r) => {
      if (r.status !== 'approved') return false;

      // Customer can order under zones only
      if (filters.underZoneOnly) {
        const restDist = calculateDistanceKm(
          r.coordinates?.lat || 12.9352,
          r.coordinates?.lng || 77.6245,
          currentLocation.lat,
          currentLocation.lng
        );
        const isZoneMatch =
          (currentLocation.zoneId && r.zoneId === currentLocation.zoneId) ||
          restDist <= (currentZone.radiusKm || 8);
        if (!isZoneMatch) return false;
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = r.name.toLowerCase().includes(q);
        const matchCuisine = r.cuisine.some((c) => c.toLowerCase().includes(q));
        const matchAddress = r.address?.toLowerCase().includes(q);
        const matchDishes = menuItems.some(
          (m) =>
            m.restaurantId === r.id &&
            (m.name.toLowerCase().includes(q) ||
              m.description?.toLowerCase().includes(q) ||
              m.category?.toLowerCase().includes(q))
        );
        if (!matchName && !matchCuisine && !matchAddress && !matchDishes) return false;
      }

      if (selectedCategory !== 'all') {
        const matchedCuisine = cuisines?.find(
          (c) => c.slug === selectedCategory || c.id === selectedCategory
        );
        const targetQuery = (matchedCuisine?.name || selectedCategory).toLowerCase();

        if (selectedCategory === 'veg' && !r.pureVeg) return false;

        const hasCuisineMatch = r.cuisine.some((c) => {
          const cLower = c.toLowerCase();
          return (
            cLower.includes(targetQuery) ||
            targetQuery.includes(cLower) ||
            (matchedCuisine?.slug && cLower.includes(matchedCuisine.slug))
          );
        });

        if (selectedCategory === 'biryani' && !hasCuisineMatch && !r.cuisine.some((c) => c.toLowerCase().includes('biryani')))
          return false;
        if (selectedCategory === 'pizza' && !hasCuisineMatch && !r.cuisine.some((c) => c.toLowerCase().includes('pizza') || c.toLowerCase().includes('italian')))
          return false;
        if (selectedCategory === 'south' && !hasCuisineMatch && !r.cuisine.some((c) => c.toLowerCase().includes('south')))
          return false;
        if (selectedCategory === 'chinese' && !hasCuisineMatch && !r.cuisine.some((c) => c.toLowerCase().includes('chinese') || c.toLowerCase().includes('asian')))
          return false;
        if (selectedCategory === 'burger' && !hasCuisineMatch && !r.cuisine.some((c) => c.toLowerCase().includes('burger') || c.toLowerCase().includes('fast food')))
          return false;
        if (selectedCategory === 'desserts' && !hasCuisineMatch && !r.cuisine.some((c) => c.toLowerCase().includes('dessert') || c.toLowerCase().includes('bakery')))
          return false;

        if (!hasCuisineMatch && selectedCategory !== 'veg') return false;
      }

      // Filter: Pure Veg
      if (filters.pureVeg && !r.pureVeg) return false;

      // Filter: Minimum Customer Rating
      if (filters.minRating > 0 && r.rating < filters.minRating) return false;

      // Filter: Estimated Delivery Time
      if (filters.maxDeliveryTime > 0 && r.deliveryTimeMins > filters.maxDeliveryTime) return false;

      // Filter: Offers & Deals
      if (filters.offersOnly && (!r.offers || r.offers.length === 0)) return false;

      // Filter: Open Kitchens Only
      if (filters.openOnly && !checkRestaurantOpenStatus(r).isOpen) return false;

      // Filter: Budget / Cost for Two
      if (filters.costRange === 'under300' && r.priceForTwo > 300) return false;
      if (filters.costRange === '300to600' && (r.priceForTwo <= 300 || r.priceForTwo > 600)) return false;
      if (filters.costRange === 'above600' && r.priceForTwo <= 600) return false;

      return true;
    });

    // Sort Restaurants
    return [...list].sort((a, b) => {
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      if (filters.sortBy === 'delivery_time') return a.deliveryTimeMins - b.deliveryTimeMins;
      if (filters.sortBy === 'cost_low') return a.priceForTwo - b.priceForTwo;
      if (filters.sortBy === 'cost_high') return b.priceForTwo - a.priceForTwo;
      return 0; // relevance: standard curated order
    });
  }, [
    restaurants,
    filters,
    searchQuery,
    selectedCategory,
    cuisines,
    menuItems,
    currentLocation,
    currentZone,
  ]);

  // Calculate matching dishes across approved restaurants for query showcase
  const matchingDishesForQuery = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return menuItems
      .filter((m) => {
        if (m.isAvailable === false) return false;
        if (filters.pureVeg && !m.isVeg) return false;
        const matchedRest = filteredRestaurants.find((r) => r.id === m.restaurantId);
        if (!matchedRest) return false;
        const nameMatch = m.name.toLowerCase().includes(q);
        const descMatch = m.description?.toLowerCase().includes(q);
        const catMatch = m.category?.toLowerCase().includes(q);
        return nameMatch || descMatch || catMatch;
      })
      .map((m) => {
        const rest = filteredRestaurants.find((r) => r.id === m.restaurantId);
        return {
          ...m,
          restaurant: rest,
        };
      });
  }, [searchQuery, menuItems, filteredRestaurants, filters.pureVeg]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* 1. CUSTOMER PORTAL */}
      {activePortal === 'customer' && (
        <>
          <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 w-full">
            {customerView === 'home' && (
              <div className="space-y-6 pb-12">
                {/* Hero promo banners */}
                <HeroBanners />

                {/* Quick-Commerce Feature Card: Likart Mart 10-Minute Groceries & Essentials */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-5 sm:p-6 shadow-lg border border-emerald-800/60">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
                  <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                    <div className="space-y-2 max-w-xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
                          <Zap className="w-3 h-3 fill-emerald-300 text-emerald-300" />
                          <span>Likart Mart Express</span>
                        </span>
                        <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-300/30">
                          ⚡ 10-Minute Delivery
                        </span>
                        <span className="text-[10px] font-bold bg-white/10 text-emerald-200 px-2 py-0.5 rounded-full border border-white/10">
                          24x7 Dark Stores
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-white">
                        Groceries, Dairy &amp; Essentials in Minutes
                      </h3>
                      <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                        Fresh milk, eggs, bread, farm vegetables, beverages, munchies, and daily household staples delivered to your doorstep in 10-12 mins.
                      </p>
                      {/* Quick Aisle Shortcuts */}
                      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
                        {[
                          { id: 'dairy_breakfast', name: 'Milk & Eggs', icon: '🥛' },
                          { id: 'fruits_vegetables', name: 'Fresh Veggies', icon: '🥦' },
                          { id: 'snacks_munchies', name: 'Snacks & Munchies', icon: '🍿' },
                          { id: 'cold_drinks', name: 'Cold Drinks', icon: '🧃' },
                          { id: 'household_cleaning', name: 'Household Staples', icon: '🧼' },
                        ].map((aisle) => (
                          <button
                            key={aisle.id}
                            type="button"
                            onClick={() => {
                              setQuickCommerceCategory(aisle.id);
                              setCustomerView('quick_commerce');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-bold text-emerald-200 hover:text-white transition whitespace-nowrap flex items-center gap-1 active:scale-95"
                          >
                            <span>{aisle.icon}</span>
                            <span>{aisle.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setQuickCommerceCategory('all');
                        setCustomerView('quick_commerce');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-emerald-500/20 transition active:scale-95 flex items-center gap-2 shrink-0"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      <span>Shop Groceries (10 Mins) →</span>
                    </button>
                  </div>
                </div>

                {/* Delivery Zone & Accurate GPS Auto-Fetch Status Bar */}
                <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-emerald-500/10 border border-orange-200/90 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div className="p-3 bg-orange-600 text-white rounded-2xl shadow-sm shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs sm:text-sm font-black uppercase text-slate-900 tracking-wide flex items-center gap-1.5">
                          <span>Auto-Fetched Zone:</span>
                          <span className="text-orange-600">{currentZone?.name || 'All Service Zones'}</span>
                        </span>
                        <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                          <span>Delivering within {currentZone?.radiusKm || 15} km</span>
                        </span>
                        {currentLocation.accuracyMeters && (
                          <span className="bg-white border border-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            GPS: ±{currentLocation.accuracyMeters}m Accuracy
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 truncate">
                        Doorstep: <span className="font-semibold text-slate-900">{currentLocation.address}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
                    {/* Zone-only ordering toggle */}
                    <button
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          underZoneOnly: !prev.underZoneOnly,
                        }))
                      }
                      className={`flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl text-xs font-bold transition border flex items-center justify-center gap-1.5 shadow-2xs ${
                        filters.underZoneOnly
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                      }`}
                      title="Only order and browse restaurants belonging to your active delivery zone"
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          filters.underZoneOnly ? 'text-white' : 'text-slate-400'
                        }`}
                      />
                      <span>Zone-Only Ordering: {filters.underZoneOnly ? 'ON' : 'ALL'}</span>
                    </button>

                    {/* Instant Zones Auto-fetch button */}
                    <button
                      onClick={() => detectUserLocation()}
                      className="px-3.5 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-bold text-xs rounded-xl transition shadow-2xs flex items-center gap-1.5 active:scale-95"
                      title="Auto-fetch high-precision GPS current location and matching delivery zone"
                    >
                      <Navigation className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
                      <span>Auto-Fetch Zone</span>
                    </button>

                    {/* Change location / map search modal button */}
                    <button
                      onClick={() => setIsLocationModalOpen(true)}
                      className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-2xs transition"
                    >
                      Search on Map
                    </button>
                  </div>
                </div>

                {/* Categories bar */}
                <CategoryBar
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />

                {/* Upgraded Customer FilterBar */}
                <FilterBar
                  filters={filters}
                  onFilterChange={setFilters}
                  totalResultsCount={filteredRestaurants.length}
                  onResetFilters={() => setFilters(DEFAULT_FILTERS)}
                />

                {/* Restaurants Grid */}
                {filteredRestaurants.length === 0 ? (
                  <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200 p-8">
                    <Store className="w-12 h-12 text-slate-300 mx-auto" />
                    <h3 className="text-lg font-black font-heading text-slate-800">
                      No matching restaurants found
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Try resetting your filters or search for another dish or cuisine.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                        setFilters(DEFAULT_FILTERS);
                      }}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRestaurants.map((restaurant) => (
                      <RestaurantCard
                        key={restaurant.id}
                        restaurant={restaurant}
                        onClick={() => {
                          setSelectedRestaurantId(restaurant.id);
                          setCustomerView('restaurant_detail');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Restaurant Detail Page */}
            {customerView === 'restaurant_detail' && (
              <RestaurantDetail
                onBack={() => {
                  setCustomerView('home');
                  setSelectedRestaurantId(null);
                }}
              />
            )}

            {/* Customer Profile & Order History */}
            {customerView === 'profile' && <CustomerProfile />}

            {/* Legal & Policy Pages */}
            {customerView === 'policy' && <PolicyPages />}

            {/* Quick-Commerce View (Likart Mart: Groceries, Household Essentials & Daily Items) */}
            {customerView === 'quick_commerce' && (
              <QuickCommerceView
                onSwitchToFoodDelivery={() => {
                  setCustomerView('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                setIsCartOpen={setIsCartOpen}
                initialCategory={quickCommerceCategory}
              />
            )}
          </main>

          <Footer />

          {/* Customer Global Modals */}
          <LocationModal />
          <AuthModal />
          <CartDrawer />
          <CheckoutModal />
          <OrderTrackingModal />
          <SupportModal />
        </>
      )}

      {/* 2. RESTAURANT / VENDOR PORTAL */}
      {activePortal === 'restaurant' && (
        <div className="flex-1 bg-slate-100/70 pb-16">
          {authRestaurant ? (
            <RestaurantDashboard />
          ) : restaurantSubView === 'onboarding' ? (
            <RestaurantOnboarding
              onBackToCustomer={() => setActivePortal('customer')}
              onGoToDashboard={() => setRestaurantSubView('login')}
            />
          ) : (
            <RestaurantLogin
              onBackToCustomer={() => setActivePortal('customer')}
              onGoToOnboarding={() => setRestaurantSubView('onboarding')}
            />
          )}
        </div>
      )}

      {/* 3. DELIVERY PARTNER PORTAL */}
      {activePortal === 'delivery' && (
        <div className="flex-1 bg-slate-100/70 pb-16">
          {authRider ? (
            <DeliveryDashboard />
          ) : deliverySubView === 'onboarding' ? (
            <DeliveryOnboarding
              onBackToCustomer={() => setActivePortal('customer')}
              onGoToDashboard={() => setDeliverySubView('login')}
            />
          ) : (
            <DeliveryLogin
              onBackToCustomer={() => setActivePortal('customer')}
              onGoToOnboarding={() => setDeliverySubView('onboarding')}
            />
          )}
        </div>
      )}

      {/* 4. SUPER ADMIN DASHBOARD */}
      {activePortal === 'admin' && (
        <div className="flex-1 bg-slate-100/70 pb-16">
          {authAdmin ? (
            authAdmin.id === 'adm-mart-super' || adminInitialTab === 'likart_mart' ? (
              <MartSuperAdminDashboard />
            ) : (
              <AdminDashboard />
            )
          ) : (
            <AdminLogin
              onBackToCustomer={() => setActivePortal('customer')}
              initialMode={adminInitialTab === 'likart_mart' ? 'likart_mart' : 'likart_food'}
            />
          )}
        </div>
      )}

      {/* 5. LIKART MART (10M GROCERIES) STORE MANAGER PORTAL */}
      {activePortal === 'mart_manager' && (
        <div className="flex-1 bg-slate-100/70 pb-16">
          {authMartManager ? (
            <MartManagerDashboard />
          ) : (
            <MartManagerLogin onBackToCustomer={() => setActivePortal('customer')} />
          )}
        </div>
      )}

      {/* Global Universal Access & Device Link Modal */}
      <WebsiteUniversalAccessModal
        isOpen={isBrowseOnOtherDevicesModalOpen}
        onClose={() => setIsBrowseOnOtherDevicesModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
