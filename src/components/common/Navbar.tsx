import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SmartSearchBox } from '../customer/SmartSearchBox';
import {
  MapPin,
  Search,
  Percent,
  ShoppingBag,
  User,
  Bell,
  ChevronDown,
  HelpCircle,
  LogOut,
  Heart,
  FileText,
  ShieldAlert,
  Headphones,
  Trash2,
  Navigation,
  Compass,
  Zap,
  UtensilsCrossed,
  ShieldCheck,
  Smartphone,
  Laptop,
  Globe,
} from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ searchQuery, setSearchQuery }) => {
  const {
    currentLocation,
    currentZone,
    setIsLocationModalOpen,
    detectUserLocation,
    cart,
    cartTotals,
    setIsCartOpen,
    customerUser,
    logoutCustomer,
    setIsAuthModalOpen,
    customerView,
    setCustomerView,
    setSelectedRestaurantId,
    setActivePortal,
    notifications,
    markNotificationRead,
    customerProfileTab,
    setCustomerProfileTab,
    setIsSupportModalOpen,
    activeTrackingOrderId,
    setIsTrackingModalOpen,
    orders,
    brandSettings,
    clearNotifications,
    setAdminInitialTab,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isAutoFetchingZone, setIsAutoFetchingZone] = useState(false);

  const handleQuickAutoFetchZone = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAutoFetchingZone(true);
    try {
      await detectUserLocation();
    } finally {
      setIsAutoFetchingZone(false);
    }
  };

  const customerNotifications = notifications.filter((n) => n.type !== 'system');
  const unreadCount = customerNotifications.filter((n) => !n.read).length;
  const activeOrder = orders.find(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  );

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Location Picker */}
        <div className="flex items-center gap-6 min-w-0">
          {/* Brand Logo */}
          <div
            onClick={() => {
              setCustomerView('home');
              setSelectedRestaurantId(null);
            }}
            className="cursor-pointer flex items-center gap-2.5 shrink-0 group"
          >
            {brandSettings.logoUrl ? (
              <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200/90 shadow-sm p-1 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition">
                <img
                  src={brandSettings.logoUrl}
                  alt={brandSettings.brandName}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition">
                <span className="font-heading font-black text-xl tracking-tight">L</span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-xl font-black font-heading tracking-tight text-slate-900 group-hover:text-orange-600 transition flex items-center gap-1">
                {brandSettings.brandName}
                <span className="w-2 h-2 rounded-full bg-orange-500 inline-block animate-pulse"></span>
              </span>
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase -mt-1 hidden sm:block">
                PREMIUM DELIVERY
              </span>
            </div>
          </div>

          {/* Location Selector with Auto-Fetched Delivery Zone */}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-xl transition text-left max-w-[240px] border border-transparent hover:border-slate-200"
              title="Click to view details or change location pin on map"
            >
              <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg shrink-0">
                <MapPin className="w-4 h-4 fill-orange-500 text-orange-500" />
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Deliver To
                  </span>
                  <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.2 rounded shrink-0">
                    {currentZone?.name ? currentZone.name.split(' ')[0] : 'All'} Zone
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
                </div>
                <p className="text-xs text-slate-500 truncate font-medium">
                  {currentLocation.address}
                </p>
              </div>
            </button>

            {/* Quick Auto-Fetch Zone GPS Button */}
            <button
              onClick={handleQuickAutoFetchZone}
              disabled={isAutoFetchingZone}
              className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200/90 rounded-xl text-[11px] font-extrabold flex items-center gap-1 transition shadow-2xs active:scale-95 disabled:opacity-50 shrink-0"
              title="Auto-fetch your delivery zone based on high-precision device GPS"
            >
              <Navigation className={`w-3.5 h-3.5 text-orange-600 ${isAutoFetchingZone ? 'animate-spin' : 'animate-pulse'}`} />
              <span>{isAutoFetchingZone ? 'Fetching...' : 'Auto-Fetch Zone'}</span>
            </button>
          </div>
        </div>

        {/* Quick Mode Switcher: Food Delivery vs Quick Mart (10-min groceries) */}
        <div className="hidden lg:flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200/90 shrink-0">
          <button
            type="button"
            onClick={() => {
              setCustomerView('home');
              setSelectedRestaurantId(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition active:scale-95 ${
              customerView !== 'quick_commerce'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Food</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setCustomerView('quick_commerce');
              setSelectedRestaurantId(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition active:scale-95 ${
              customerView === 'quick_commerce'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
            <span>Quick Mart</span>
            <span className="text-[9px] bg-amber-400 text-slate-950 px-1 py-0.2 rounded font-black uppercase">
              10m
            </span>
          </button>
        </div>

        {/* Center: Smart Search Box and Portal Links */}
        <div className="flex-1 max-w-lg hidden sm:flex items-center gap-3">
          <div className="flex-1">
            <SmartSearchBox
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>

          {/* Quick Header Portal Navigation */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setActivePortal('mart_manager')}
              className="px-2.5 py-1.5 rounded-xl font-black text-emerald-800 bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200/90 transition whitespace-nowrap flex items-center gap-1 shadow-2xs"
              title="Likart Mart Dark Store Pod Operations & Inventory"
            >
              <Zap className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
              <span>Store Manager</span>
            </button>
            <button
              onClick={() => {
                setAdminInitialTab('likart_mart');
                setActivePortal('admin');
              }}
              className="px-2.5 py-1.5 rounded-xl font-black text-emerald-950 bg-emerald-100/90 hover:bg-emerald-200/90 border border-emerald-300 transition whitespace-nowrap flex items-center gap-1 shadow-2xs"
              title="Likart Mart (10m Groceries) Super Admin Command Center"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Mart Super Admin</span>
            </button>
            <button
              onClick={() => {
                setAdminInitialTab('overview');
                setActivePortal('admin');
              }}
              className="px-2.5 py-1.5 rounded-xl font-black text-orange-950 bg-orange-50 hover:bg-orange-100/90 border border-orange-200/90 transition whitespace-nowrap flex items-center gap-1 shadow-2xs"
              title="Likart Food Super Admin Control Center"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-orange-600" />
              <span>Food Super Admin</span>
            </button>
            <button
              onClick={() => setActivePortal('restaurant')}
              className="px-2 py-1.5 rounded-xl font-bold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition whitespace-nowrap"
            >
              Partner
            </button>
            <button
              onClick={() => setActivePortal('delivery')}
              className="px-2 py-1.5 rounded-xl font-bold text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition whitespace-nowrap"
            >
              Rider
            </button>
          </div>
        </div>

        {/* Right: Actions (Offers, Support, Notifs, Active Order, Cart, Profile) */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          {/* Active order quick track pill */}
          {activeOrder && (
            <button
              onClick={() => {
                setIsTrackingModalOpen(true);
              }}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl transition shadow-xs animate-pulse"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Track Live Order #{activeOrder.id}</span>
            </button>
          )}

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs rounded-2xl shadow-md shadow-orange-600/20 transition active:scale-95"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Cart</span>
            {cart.length > 0 && (
              <span className="border-l border-white/30 pl-2">
                ₹{cartTotals.grandTotal}
              </span>
            )}
          </button>

          {/* Profile Button with LIKART Care 24/7 and Notifications inside After-Login Profile */}
          <div className="relative">
            {customerUser ? (
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 pr-2.5 hover:bg-slate-100 rounded-2xl transition border border-slate-200 relative"
              >
                <div className="relative">
                  <img
                    src={customerUser.avatar}
                    alt={customerUser.name}
                    className="w-8 h-8 rounded-xl object-cover ring-2 ring-orange-500/30"
                  />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-orange-600 border-2 border-white rounded-full flex items-center justify-center text-[8px] font-black text-white">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-800 hidden md:inline truncate max-w-[90px]">
                  {customerUser.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-orange-600 hover:bg-orange-50 rounded-xl transition border border-orange-200"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}

            {/* Profile Dropdown (After-Login Profile Hub) */}
            {showProfileMenu && customerUser && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-3 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-slate-900 truncate">{customerUser.name}</p>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-md">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{customerUser.email}</p>
                  <p className="text-[10px] text-orange-600 font-bold mt-0.5">{customerUser.phone}</p>
                </div>

                <div className="py-1 space-y-0.5">
                  {/* Notifications Option with 1-Click Clear in After-Login Profile */}
                  <div className="flex items-center justify-between px-3 py-2 hover:bg-orange-50/80 rounded-xl transition group">
                    <button
                      onClick={() => {
                        setCustomerProfileTab('notifications');
                        setCustomerView('profile');
                        setShowProfileMenu(false);
                      }}
                      className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 group-hover:text-orange-600 flex-1 text-left"
                    >
                      <Bell className="w-4 h-4 text-orange-600 shrink-0" />
                      <span>Notifications</span>
                      {unreadCount > 0 ? (
                        <span className="px-1.5 py-0.5 bg-orange-600 text-white text-[9px] font-black rounded-full shadow-2xs">
                          {unreadCount} new
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">({customerNotifications.length})</span>
                      )}
                    </button>
                    {customerNotifications.length > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearNotifications();
                        }}
                        className="text-[10px] text-slate-400 hover:text-rose-600 flex items-center gap-1 px-1.5 py-0.5 hover:bg-rose-50 rounded-md transition font-medium"
                        title="Clear all notifications"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear</span>
                      </button>
                    )}
                  </div>

                  {/* LIKART Care 24/7 Option inside After-Login Profile */}
                  <button
                    onClick={() => {
                      setCustomerProfileTab('care');
                      setCustomerView('profile');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl flex items-center justify-between transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Headphones className="w-4 h-4 text-emerald-600 shrink-0 group-hover:scale-110 transition" />
                      <span>LIKART Care 24/7 Desk</span>
                    </div>
                    <span className="flex items-center gap-1 text-[9px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Live</span>
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setCustomerProfileTab('addresses');
                      setCustomerView('profile');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-orange-600 rounded-xl flex items-center gap-2.5 transition"
                  >
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>My Profile & Addresses</span>
                  </button>

                  <button
                    onClick={() => {
                      setCustomerProfileTab('orders');
                      setCustomerView('profile');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-orange-600 rounded-xl flex items-center gap-2.5 transition"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Past Orders & Invoices</span>
                  </button>

                  <div className="pt-1.5 mt-1 border-t border-slate-100">
                    <p className="px-3 text-[10px] font-black uppercase text-slate-400 mb-1">
                      Staff &amp; Operator Access
                    </p>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setActivePortal('mart_manager');
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-50 rounded-xl flex items-center gap-2 transition"
                    >
                      <Zap className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                      <span>Likart Mart Store Manager</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setAdminInitialTab('likart_mart');
                        setActivePortal('admin');
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-bold text-emerald-900 hover:bg-emerald-50 rounded-xl flex items-center gap-2 transition"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Likart Mart Super Admin</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setAdminInitialTab('overview');
                        setActivePortal('admin');
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-bold text-orange-900 hover:bg-orange-50 rounded-xl flex items-center gap-2 transition"
                    >
                      <UtensilsCrossed className="w-3.5 h-3.5 text-orange-600" />
                      <span>Likart Food Super Admin</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      logoutCustomer();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2.5 transition mt-1 border-t border-slate-100 pt-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search bar and Mode Switcher */}
      <div className="sm:hidden px-4 pb-3 space-y-2">
        <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200/80 shadow-2xs">
          <button
            type="button"
            onClick={() => {
              setCustomerView('home');
              setSelectedRestaurantId(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-black transition active:scale-95 ${
              customerView !== 'quick_commerce'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-600'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Food Delivery</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setCustomerView('quick_commerce');
              setSelectedRestaurantId(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-black transition active:scale-95 ${
              customerView === 'quick_commerce'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
            <span>Quick Mart (10m)</span>
          </button>
        </div>

        <SmartSearchBox
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isMobile={true}
        />

        {/* Mobile quick portal login shortcuts */}
        <div className="flex items-center text-[11px] pt-1 text-slate-500 overflow-x-auto scrollbar-none gap-1.5 pb-0.5">
          <span className="font-black text-[10px] text-slate-400 uppercase shrink-0">Portals:</span>
          <button
            type="button"
            onClick={() => setActivePortal('mart_manager')}
            className="shrink-0 px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black border border-emerald-200/80 flex items-center gap-1 transition shadow-2xs"
          >
            <Zap className="w-3 h-3 fill-emerald-600 text-emerald-600" />
            <span>Store Manager</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAdminInitialTab('likart_mart');
              setActivePortal('admin');
            }}
            className="shrink-0 px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-black border border-emerald-300 flex items-center gap-1 transition shadow-2xs"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-700" />
            <span>Mart Admin</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAdminInitialTab('overview');
              setActivePortal('admin');
            }}
            className="shrink-0 px-2.5 py-1 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-950 font-black border border-orange-200 flex items-center gap-1 transition shadow-2xs"
          >
            <UtensilsCrossed className="w-3 h-3 text-orange-600" />
            <span>Food Admin</span>
          </button>
          <button
            type="button"
            onClick={() => setActivePortal('restaurant')}
            className="shrink-0 px-2 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
          >
            Partner
          </button>
          <button
            type="button"
            onClick={() => setActivePortal('delivery')}
            className="shrink-0 px-2 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
          >
            Rider
          </button>
        </div>
      </div>
    </header>
  );
};
