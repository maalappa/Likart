import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Store,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  Utensils,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  TrendingUp,
  Download,
  Power,
  Layers,
  Search,
  Filter,
  Eye,
  Camera,
  FileCheck,
  FileText,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  X,
  Check,
  MapPin,
  Navigation,
  Globe,
  Smartphone,
  Calendar,
  CalendarDays,
  Save,
  Sun,
  Moon,
  Timer,
  Info,
  Bell,
  Volume2,
  VolumeX,
  AlertOctagon,
  CheckCircle2,
  RotateCcw,
  ThumbsDown,
  User,
  Phone,
  Package,
  Tag,
  Percent,
} from 'lucide-react';
import { Order, MenuItem, RestaurantCategory, DaySchedule } from '../../types';
import {
  startRestaurantOrderRinging,
  stopRestaurantOrderRinging,
  playAudioTunePreview,
} from '../../utils/soundUtils';
import { FoodItemModal } from './modals/FoodItemModal';
import { CategoryModal } from './modals/CategoryModal';
import { RestaurantPayoutModal } from './modals/RestaurantPayoutModal';
import { RestaurantEarningsHub } from './RestaurantEarningsHub';
import { DeleteConfirmModal } from '../admin/modals/DeleteConfirmModal';
import { LiveMap } from '../common/LiveMap';
import {
  formatTime12h,
  getDefaultSchedule,
  checkRestaurantOpenStatus,
  DAYS_OF_WEEK,
} from '../../utils/timeUtils';

export const RestaurantDashboard: React.FC = () => {
  const {
    restaurants,
    currentRestaurantId,
    setCurrentRestaurantId,
    authRestaurant,
    logoutRestaurant,
    setActivePortal,
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleMenuItemAvailability,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    orders,
    updateOrderStatus,
    acceptOrderByRestaurant,
    rejectOrderByRestaurant,
    requestPayout,
    payoutRequests,
    cancelPayoutRequest,
    simulateOrderForRestaurant,
    addNotification,
    updateRestaurant,
    zones,
    brandSettings,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'categories' | 'timings' | 'finances' | 'kyc' | 'map'>('orders');
  const [ordersFilter, setOrdersFilter] = useState<'all' | 'placed' | 'in_kitchen' | 'ready' | 'delivered' | 'cancelled'>('all');
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [acceptModalOrder, setAcceptModalOrder] = useState<Order | null>(null);
  const [acceptPrepMinutes, setAcceptPrepMinutes] = useState<number>(20);
  const [rejectModalOrder, setRejectModalOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState('Kitchen overloaded with orders');
  const [customRejectReason, setCustomRejectReason] = useState('');
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [payoutAmount, setPayoutAmount] = useState('5000');

  // Restaurant Timings & Schedule State
  const [openingTime, setOpeningTime] = useState('09:00');
  const [closingTime, setClosingTime] = useState('23:00');
  const [autoOpenClose, setAutoOpenClose] = useState(true);
  const [schedule, setSchedule] = useState<DaySchedule[]>(() => getDefaultSchedule('09:00', '23:00'));
  const [isTimingSaved, setIsTimingSaved] = useState(false);

  // Food Item Modal state
  const [foodModalState, setFoodModalState] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    item?: MenuItem | null;
  }>({
    isOpen: false,
    mode: 'add',
    item: null,
  });

  // Category Modal state
  const [categoryModalState, setCategoryModalState] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    category?: RestaurantCategory | null;
  }>({
    isOpen: false,
    mode: 'add',
    category: null,
  });

  // Delete confirmations
  const [deleteFoodItem, setDeleteFoodItem] = useState<MenuItem | null>(null);
  const [deleteCatItem, setDeleteCatItem] = useState<RestaurantCategory | null>(null);

  // Document preview modal
  const [docPreview, setDocPreview] = useState<{
    isOpen: boolean;
    title: string;
    url: string;
    number?: string;
  } | null>(null);

  // Filter and search state for dishes
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'non-veg'>('all');

  const currentTargetId = authRestaurant?.id || currentRestaurantId;
  const restaurant =
    restaurants.find((r) => r.id === currentTargetId) ||
    authRestaurant ||
    restaurants[0];

  if (!restaurant) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-md">
          <Store className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold font-heading text-slate-900">No Food Outlet Found</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          No registered restaurant outlet is currently active in your session. Please register a restaurant outlet or sign in to access the kitchen console.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => setActivePortal('customer')}
            className="px-4 py-2.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
          >
            Customer Website
          </button>
          <button
            onClick={() => logoutRestaurant()}
            className="px-5 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md transition"
          >
            Go to Partner Sign In
          </button>
        </div>
      </div>
    );
  }

  const restaurantOrders = orders.filter((o) => o.restaurantId === restaurant.id);
  const liveOrders = restaurantOrders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  );
  const newPlacedOrders = restaurantOrders.filter((o) => o.status === 'placed');
  const inKitchenOrders = restaurantOrders.filter((o) => o.status === 'confirmed' || o.status === 'preparing');
  const readyOrders = restaurantOrders.filter((o) => o.status === 'ready_for_pickup');
  const completedOrders = restaurantOrders.filter((o) => o.status === 'delivered');
  const cancelledOrders = restaurantOrders.filter((o) => o.status === 'cancelled');

  const displayedOrders = restaurantOrders.filter((o) => {
    if (ordersFilter === 'placed') return o.status === 'placed';
    if (ordersFilter === 'in_kitchen') return o.status === 'confirmed' || o.status === 'preparing';
    if (ordersFilter === 'ready') return o.status === 'ready_for_pickup';
    if (ordersFilter === 'delivered') return o.status === 'delivered';
    if (ordersFilter === 'cancelled') return o.status === 'cancelled';
    return o.status !== 'delivered' && o.status !== 'cancelled';
  });

  // Restaurant Order Sound Alert Configuration from Brand Settings
  const isSoundActive =
    (brandSettings.soundAlerts?.enabled !== false) &&
    (brandSettings.soundAlerts?.restaurantSoundEnabled !== false) &&
    soundAlerts;
  const currentRestaurantVolume = brandSettings.soundAlerts?.restaurantVolume ?? 0.85;
  const customRestaurantAudio = brandSettings.soundAlerts?.restaurantAudioUrl;

  // Ring continuously UNTIL kitchen accepts (or rejects) all placed orders
  useEffect(() => {
    if (newPlacedOrders.length > 0 && isSoundActive) {
      startRestaurantOrderRinging(customRestaurantAudio, currentRestaurantVolume);
    } else {
      stopRestaurantOrderRinging();
    }

    return () => {
      stopRestaurantOrderRinging();
    };
  }, [newPlacedOrders.length, isSoundActive, customRestaurantAudio, currentRestaurantVolume]);

  const myMenuItems = menuItems.filter((m) => m.restaurantId === restaurant.id);

  // Filtered menu items
  const filteredMenuItems = myMenuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === 'all' || item.category === selectedCategoryFilter;
    const matchesVeg =
      vegFilter === 'all' ||
      (vegFilter === 'veg' && item.isVeg) ||
      (vegFilter === 'non-veg' && !item.isVeg);
    return matchesSearch && matchesCategory && matchesVeg;
  });

  // Financial calculations with auto-deducted platform commission
  const commRate =
    typeof restaurant.commissionRate === 'number'
      ? restaurant.commissionRate
      : (brandSettings?.defaultCommissionRate ?? 15);

  const totalGrossSales = restaurantOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.itemTotal || 0), 0);

  const totalAutoCommission = Math.round((totalGrossSales * commRate) / 100);
  const netEarningsLifetime = Math.max(0, totalGrossSales - totalAutoCommission);

  const myPayoutRequests = payoutRequests.filter(
    (p) => p.recipientType === 'restaurant' && p.recipientId === restaurant.id
  );
  const settledPayouts = myPayoutRequests
    .filter((p) => p.status === 'settled')
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingPayouts = myPayoutRequests
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  // Net Lifetime Earnings auto-resets to zero after settled payouts
  const netEarnings = Math.max(0, netEarningsLifetime - settledPayouts);
  const availablePayout = Math.max(0, netEarnings - pendingPayouts);

  const handleSaveFoodItem = (data: any) => {
    if (foodModalState.mode === 'add') {
      addMenuItem(data);
    } else if (foodModalState.item) {
      updateMenuItem(foodModalState.item.id, data);
    }
  };

  const handleQuickAdjustItemStock = (item: MenuItem, delta: number) => {
    const current = item.stockQuantity ?? 0;
    const nextStock = Math.max(0, current + delta);
    updateMenuItem(item.id, {
      hasStockTracking: true,
      stockQuantity: nextStock,
      isAvailable: nextStock > 0 ? item.isAvailable : false,
    });
  };

  const handleSaveCategory = (data: any) => {
    if (categoryModalState.mode === 'add') {
      addCategory(data);
    } else if (categoryModalState.category) {
      updateCategory(categoryModalState.category.id, data);
    }
  };

  const handleConfirmDeleteFood = () => {
    if (deleteFoodItem) {
      deleteMenuItem(deleteFoodItem.id);
      setDeleteFoodItem(null);
    }
  };

  const handleConfirmDeleteCategory = () => {
    if (deleteCatItem) {
      deleteCategory(deleteCatItem.id);
      setDeleteCatItem(null);
    }
  };

  // Sync timing settings whenever restaurant changes
  useEffect(() => {
    if (restaurant) {
      setOpeningTime(restaurant.openingTime || '09:00');
      setClosingTime(restaurant.closingTime || '23:00');
      setAutoOpenClose(restaurant.autoOpenClose ?? true);
      if (restaurant.schedule && restaurant.schedule.length === 7) {
        setSchedule(restaurant.schedule);
      } else {
        setSchedule(getDefaultSchedule(restaurant.openingTime || '09:00', restaurant.closingTime || '23:00'));
      }
    }
  }, [
    restaurant?.id,
    restaurant?.openingTime,
    restaurant?.closingTime,
    restaurant?.autoOpenClose,
    restaurant?.schedule,
  ]);

  const handleSaveTimings = () => {
    updateRestaurant(restaurant.id, {
      openingTime,
      closingTime,
      autoOpenClose,
      schedule,
    });
    setIsTimingSaved(true);
    setTimeout(() => setIsTimingSaved(false), 3500);
    addNotification(
      'Kitchen Timings Updated',
      `Operating hours updated: ${formatTime12h(openingTime)} to ${formatTime12h(closingTime)}. Automated kitchen timer updated.`,
      'system'
    );
  };

  const handleApplyToAllDays = () => {
    setSchedule((prev) =>
      prev.map((d) => ({
        ...d,
        isOpen: true,
        openTime: openingTime,
        closeTime: closingTime,
      }))
    );
  };

  const handleApplyPresetTimings = (open: string, close: string) => {
    setOpeningTime(open);
    setClosingTime(close);
    setSchedule((prev) =>
      prev.map((d) => ({
        ...d,
        openTime: open,
        closeTime: close,
      }))
    );
  };

  const handleToggleDay = (dayName: string) => {
    setSchedule((prev) =>
      prev.map((d) => (d.day === dayName ? { ...d, isOpen: !d.isOpen } : d))
    );
  };

  const handleUpdateDay = (dayName: string, field: 'openTime' | 'closeTime', val: string) => {
    setSchedule((prev) =>
      prev.map((d) => (d.day === dayName ? { ...d, [field]: val } : d))
    );
  };

  const currentOpenStatus = checkRestaurantOpenStatus(restaurant);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Restaurant Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={restaurant.logo}
            alt={restaurant.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/30"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-900">
                {restaurant.name}
              </h2>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  restaurant.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {restaurant.status.toUpperCase()}
              </span>
              {restaurant.pureVeg && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  100% Pure Veg
                </span>
              )}
              {/* Real-time kitchen open status badge */}
              <span
                className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs ${
                  currentOpenStatus.isOpen
                    ? 'bg-emerald-600 text-white'
                    : 'bg-rose-600 text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>{currentOpenStatus.timeBadgeText}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
              <span>Owner: <strong className="text-slate-700">{restaurant.ownerName}</strong></span>
              <span>•</span>
              <span>Phone: <strong className="text-slate-700">{restaurant.phone}</strong></span>
              <span>•</span>
              <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-bold border border-emerald-200 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-600" />
                <span>{formatTime12h(restaurant.openingTime || '09:00')} – {formatTime12h(restaurant.closingTime || '23:00')}</span>
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Master Kitchen Open/Closed Toggle with direct update */}
          <button
            type="button"
            onClick={() => {
              const newIsOpen = !restaurant.isOpen;
              updateRestaurant(restaurant.id, { isOpen: newIsOpen });
              addNotification(
                'Kitchen Status Updated',
                `Kitchen is now manually set to ${newIsOpen ? 'Open for Orders' : 'Temporarily Closed'}.`,
                'system'
              );
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-2xs active:scale-95 ${
              restaurant.isOpen
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-500/30'
                : 'bg-rose-600 text-white hover:bg-rose-700 ring-2 ring-rose-500/30'
            }`}
            title="Click to toggle restaurant kitchen status immediately"
          >
            <Power className="w-3.5 h-3.5" />
            <span>{restaurant.isOpen ? 'Kitchen Open (Accepting)' : 'Kitchen Closed (Pause)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('timings')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition flex items-center gap-1"
          >
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Set Hours</span>
          </button>

          <button
            onClick={() => {
              logoutRestaurant();
            }}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition"
          >
            Log Out
          </button>

          <button
            onClick={() => setActivePortal('customer')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
          >
            Customer Web
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 ${
            activeTab === 'orders'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Live Orders ({liveOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 ${
            activeTab === 'menu'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Food Catalog ({myMenuItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 ${
            activeTab === 'categories'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Categories ({categories.length})</span>
        </button>

        {/* Timings & Opening/Closing Hours Tab */}
        <button
          onClick={() => setActiveTab('timings')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 ${
            activeTab === 'timings'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Timings & Schedule</span>
        </button>

        <button
          onClick={() => setActiveTab('finances')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 ${
            activeTab === 'finances'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Earnings & Payouts</span>
          {pendingPayouts > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('kyc')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 ${
            activeTab === 'kyc'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>KYC & Documents</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 ${
            activeTab === 'map'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Google Map & Delivery Radius</span>
        </button>
      </div>

      {/* Tab 1: Live Orders Board */}
      {activeTab === 'orders' && (
        <div className="space-y-5">
          {/* Incoming Orders Kitchen Alert Banner */}
          {newPlacedOrders.length > 0 && (
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-5 text-white shadow-lg flex flex-wrap items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0">
                  <Bell className="w-6 h-6 text-white animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full">
                      Action Required
                    </span>
                    <span className="text-xs font-medium text-amber-100">
                      Incoming Customer Orders
                    </span>
                  </div>
                  <h3 className="font-heading font-black text-lg sm:text-xl text-white mt-0.5">
                    {newPlacedOrders.length} New Order{newPlacedOrders.length > 1 ? 's' : ''} Awaiting Kitchen Acceptance!
                  </h3>
                  <p className="text-xs text-amber-100">
                    Review dishes, set preparation time, and accept or reject below to notify customer and dispatch riders.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSoundAlerts(!soundAlerts)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                      soundAlerts
                        ? 'bg-white/20 border-white/30 text-white'
                        : 'bg-black/20 border-black/30 text-white/70'
                    }`}
                    title="Toggle Kitchen Alert Chimes"
                  >
                    {soundAlerts ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    <span>{soundAlerts ? 'Alert: ON' : 'Muted'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => playAudioTunePreview(customRestaurantAudio, 'restaurant', currentRestaurantVolume)}
                    className="p-2 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 border border-white/25 text-white transition"
                    title="Test Restaurant Orders Alert Sound"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setOrdersFilter('placed')}
                  className="px-4 py-2 bg-white text-orange-700 hover:bg-orange-50 font-black text-xs rounded-xl shadow-md transition"
                >
                  View New ({newPlacedOrders.length})
                </button>
              </div>
            </div>
          )}

          {/* Sub-Filters and Sound Control Bar */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <button
                type="button"
                onClick={() => setOrdersFilter('all')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                  ordersFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>All Active</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-mono">
                  {liveOrders.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setOrdersFilter('placed')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                  ordersFilter === 'placed'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
                }`}
              >
                {newPlacedOrders.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                )}
                <span>New Placed</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  ordersFilter === 'placed' ? 'bg-white/25 text-white' : 'bg-amber-200 text-amber-900'
                }`}>
                  {newPlacedOrders.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setOrdersFilter('in_kitchen')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                  ordersFilter === 'in_kitchen'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>In Kitchen</span>
                <span className="text-[10px] bg-slate-200/80 px-1.5 py-0.2 rounded-full font-mono">
                  {inKitchenOrders.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setOrdersFilter('ready')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                  ordersFilter === 'ready'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>Ready for Pickup</span>
                <span className="text-[10px] bg-slate-200/80 px-1.5 py-0.2 rounded-full font-mono">
                  {readyOrders.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setOrdersFilter('delivered')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                  ordersFilter === 'delivered'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>Past Delivered</span>
                <span className="text-[10px] bg-slate-200/80 px-1.5 py-0.2 rounded-full font-mono">
                  {completedOrders.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setOrdersFilter('cancelled')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                  ordersFilter === 'cancelled'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                <span>Rejected / Cancelled</span>
                <span className="text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.2 rounded-full font-mono">
                  {cancelledOrders.length}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Real-time dispatch synchronization active</span>
            </div>
          </div>

          {/* Orders Cards Grid */}
          {displayedOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Utensils className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-700">
                {ordersFilter === 'placed'
                  ? 'No incoming orders waiting for acceptance'
                  : ordersFilter === 'cancelled'
                  ? 'No rejected or cancelled orders'
                  : 'No orders found in this section'}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {ordersFilter === 'placed'
                  ? 'When customers place orders from your restaurant, they will appear here with instant Accept / Reject controls.'
                  : 'Customer orders will update automatically as food transitions through the kitchen.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedOrders.map((ord) => {
                const isPlaced = ord.status === 'placed';
                const isConfirmed = ord.status === 'confirmed';
                const isPreparing = ord.status === 'preparing';
                const isReady = ord.status === 'ready_for_pickup';
                const isOutForDelivery = ord.status === 'out_for_delivery' || ord.status === 'rider_assigned';
                const isDelivered = ord.status === 'delivered';
                const isCancelled = ord.status === 'cancelled';

                return (
                  <div
                    key={ord.id}
                    className={`bg-white rounded-3xl p-5 border shadow-xs flex flex-col justify-between space-y-4 transition ${
                      isPlaced
                        ? 'border-2 border-amber-400 ring-4 ring-amber-400/10'
                        : isCancelled
                        ? 'border-rose-200 bg-rose-50/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black font-mono text-slate-900">
                              #{ord.id}
                            </span>
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                              {ord.paymentMethod}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {ord.createdAt}
                          </p>
                        </div>

                        <span
                          className={`text-xs font-black px-2.5 py-1 rounded-full uppercase ${
                            isPlaced
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : isConfirmed || isPreparing
                              ? 'bg-blue-100 text-blue-800'
                              : isReady
                              ? 'bg-purple-100 text-purple-800'
                              : isDelivered
                              ? 'bg-emerald-100 text-emerald-800'
                              : isCancelled
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {ord.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* Customer Info */}
                      <div className="py-2.5 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{ord.customerName}</span>
                          </span>
                          <a
                            href={`tel:${ord.customerPhone}`}
                            className="text-slate-500 hover:text-emerald-600 font-semibold flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{ord.customerPhone}</span>
                          </a>
                        </div>

                        {/* Special Instructions */}
                        {ord.deliveryInstructions && (
                          <div className="p-2 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-1.5">
                            <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span><strong>Cooking / Delivery Note:</strong> {ord.deliveryInstructions}</span>
                          </div>
                        )}

                        {/* Estimated prep time if set */}
                        {ord.estimatedPrepTimeMins && isPreparing && (
                          <div className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg w-fit">
                            <Timer className="w-3.5 h-3.5" />
                            <span>Estimated Prep: {ord.estimatedPrepTimeMins} mins</span>
                          </div>
                        )}

                        {/* Order Items Summary */}
                        <div className="bg-slate-50 p-2.5 rounded-xl space-y-1.5 text-xs text-slate-700 max-h-36 overflow-y-auto">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                              <span className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${it.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                                <span className="font-medium text-slate-800">
                                  {it.quantity}x {it.name}
                                </span>
                              </span>
                              <span className="font-bold text-slate-900">₹{it.price * it.quantity}</span>
                            </div>
                          ))}
                        </div>

                        {/* Total Amount & Payment Status */}
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                          <span className="text-slate-500">
                            Total Bill: <strong className="text-slate-900">₹{ord.totalAmount}</strong>
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            ord.paymentStatus === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : ord.paymentStatus === 'refunded'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {ord.paymentStatus}
                          </span>
                        </div>

                        {/* Transparent Commission Auto-Deduction & Net Earnings Strip */}
                        {(() => {
                          const orderGross = ord.itemTotal || 0;
                          const orderComm = isCancelled ? 0 : Math.round((orderGross * commRate) / 100);
                          const orderNet = isCancelled ? 0 : Math.max(0, orderGross - orderComm);

                          return (
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-[11px] space-y-1">
                              <div className="flex items-center justify-between text-slate-600">
                                <span>Food Gross (GMV):</span>
                                <span className="font-mono font-bold text-slate-900">₹{orderGross}</span>
                              </div>
                              <div className="flex items-center justify-between text-amber-700">
                                <span>Auto Commission (-{commRate}%):</span>
                                <span className="font-mono font-bold">{isCancelled ? '₹0' : `-₹${orderComm}`}</span>
                              </div>
                              <div className="flex items-center justify-between pt-1 border-t border-slate-200 font-bold">
                                <span className="text-emerald-800">Available Net Credit:</span>
                                <span className="font-mono font-black text-emerald-700">
                                  {isCancelled ? '₹0 (Cancelled)' : `+₹${orderNet}`}
                                </span>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Assigned Delivery Partner Info if available */}
                        {ord.deliveryPartnerName && !isCancelled && (
                          <div className="text-[11px] bg-blue-50/80 p-2 rounded-xl border border-blue-100 text-blue-900 flex items-center justify-between">
                            <span>Rider: <strong>{ord.deliveryPartnerName}</strong></span>
                            <span className="font-mono text-blue-700">{ord.deliveryPartnerPhone}</span>
                          </div>
                        )}

                        {/* Rejection / Cancellation note if cancelled */}
                        {isCancelled && (
                          <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 space-y-1">
                            <p className="font-bold flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              <span>{ord.rejectedByRestaurant ? 'Rejected by Kitchen' : 'Order Cancelled'}</span>
                            </p>
                            <p className="text-[11px] text-rose-700">
                              {ord.restaurantRejectionReason || ord.cancellationReason || 'No reason specified'}
                            </p>
                            <p className="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded w-fit mt-1">
                              ✓ 100% Customer Refund Initiated
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Controls for Restaurant */}
                    <div className="pt-2 border-t border-slate-100">
                      {/* CASE 1: Placed - Explicit Accept / Reject Options */}
                      {isPlaced && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setAcceptModalOrder(ord);
                                setAcceptPrepMinutes(20);
                              }}
                              className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-95"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Accept Order</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setRejectModalOrder(ord);
                                setRejectReason('Kitchen overloaded with orders');
                                setCustomRejectReason('');
                              }}
                              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition flex items-center justify-center gap-1 active:scale-95"
                            >
                              <XCircle className="w-4 h-4 text-rose-600" />
                              <span>Reject</span>
                            </button>
                          </div>
                          <p className="text-[10px] text-center text-slate-400">
                            Chef must accept or reject within 5 minutes
                          </p>
                        </div>
                      )}

                      {/* CASE 2: Confirmed - Start Preparation & Emergency Cancel */}
                      {isConfirmed && (
                        <div className="space-y-1.5">
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'preparing', 'Chef started preparing the fresh feast in kitchen.')}
                            className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                          >
                            <Flame className="w-4 h-4" />
                            <span>Start Food Preparation</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectModalOrder(ord);
                              setRejectReason('Key dish ingredients out of stock');
                              setCustomRejectReason('');
                            }}
                            className="w-full text-center text-[11px] font-bold text-rose-600 hover:text-rose-800 py-1"
                          >
                            Emergency Cancel / Reject Order
                          </button>
                        </div>
                      )}

                      {/* CASE 3: Preparing - Mark Ready for Pickup & Emergency Cancel */}
                      {isPreparing && (
                        <div className="space-y-1.5">
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'ready_for_pickup', 'Food packed and ready for delivery partner pickup.')}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Mark Ready for Rider Pickup</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectModalOrder(ord);
                              setRejectReason('Key dish ingredients out of stock');
                              setCustomRejectReason('');
                            }}
                            className="w-full text-center text-[11px] font-bold text-rose-600 hover:text-rose-800 py-1"
                          >
                            Emergency Cancel / Reject Order
                          </button>
                        </div>
                      )}

                      {/* CASE 4: Ready for Pickup - Handover to Delivery Partner */}
                      {isReady && (
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'out_for_delivery', 'Food handed over to delivery partner.')}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                        >
                          <Utensils className="w-4 h-4" />
                          <span>Handover to Delivery Partner</span>
                        </button>
                      )}

                      {/* CASE 5: Out for delivery */}
                      {isOutForDelivery && (
                        <div className="p-2 bg-blue-50 rounded-xl text-center text-xs font-bold text-blue-700">
                          Order in Transit with Rider 🏍️
                        </div>
                      )}

                      {/* CASE 6: Delivered */}
                      {isDelivered && (
                        <div className="p-2 bg-emerald-50 rounded-xl text-center text-xs font-bold text-emerald-700 flex items-center justify-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Delivered to Customer</span>
                        </div>
                      )}

                      {/* CASE 7: Cancelled */}
                      {isCancelled && (
                        <div className="p-2 bg-slate-100 rounded-xl text-center text-xs font-bold text-slate-500">
                          Closed / Refunded
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Food Menu Catalog Management (with Add/Edit/Delete & Photo Upload) */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          {/* Top Bar with Search, Filters & Add Dish */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-heading font-black text-lg text-slate-900">
                  Food Menu Catalog & Pricing
                </h3>
                <p className="text-xs text-slate-500">
                  Add, edit, or delete dishes, manage photos, dietary labels, and availability
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalState({ isOpen: true, mode: 'add' })}
                  className="px-3.5 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl border border-purple-200 transition flex items-center gap-1.5"
                >
                  <Layers className="w-4 h-4 text-purple-600" />
                  <span>+ New Category</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFoodModalState({ isOpen: true, mode: 'add', item: null })}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center gap-2 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Food Item</span>
                </button>
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search dishes by name or ingredients..."
                    className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500 font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500 font-medium text-slate-700"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {/* Veg / Non-Veg Quick Filter */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setVegFilter('all')}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      vegFilter === 'all'
                        ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setVegFilter('veg')}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      vegFilter === 'veg'
                        ? 'bg-emerald-600 text-white shadow-2xs font-extrabold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    🥗 Veg
                  </button>
                  <button
                    onClick={() => setVegFilter('non-veg')}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      vegFilter === 'non-veg'
                        ? 'bg-rose-600 text-white shadow-2xs font-extrabold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    🍗 Non-Veg
                  </button>
                </div>
              </div>

              <span className="text-xs font-bold text-slate-400">
                Showing {filteredMenuItems.length} of {myMenuItems.length} items
              </span>
            </div>
          </div>

          {/* Food Items Grid */}
          {filteredMenuItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                <Utensils className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-sm text-slate-700">No dishes match your filter</h4>
              <p className="text-xs text-slate-400">
                Try searching with different keywords or add a new food item to this category.
              </p>
              <button
                type="button"
                onClick={() => setFoodModalState({ isOpen: true, mode: 'add', item: null })}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                + Add New Dish
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMenuItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-4 hover:border-slate-300 transition"
                >
                  {/* Photo with zoom hint */}
                  <div className="relative group shrink-0 w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 ring-1 ring-slate-200">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    {item.isBestseller && (
                      <span className="absolute top-1 left-1 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs uppercase">
                        Bestseller
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-3.5 h-3.5 border-2 rounded flex items-center justify-center p-0.5 shrink-0 ${
                          item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                          }`}
                        />
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 truncate">{item.name}</h4>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                        {item.category}
                      </span>
                      {item.spiceLevel && (
                        <span className="text-[10px] text-slate-500">
                          {item.spiceLevel === 'mild' ? '🌶️ Mild' : item.spiceLevel === 'medium' ? '🌶️🌶️ Med' : '🌶️🌶️🌶️ Hot'}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="text-sm font-black text-slate-900">₹{item.price}</span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <>
                          <span className="text-xs text-slate-400 line-through">
                            ₹{item.originalPrice}
                          </span>
                          <span className="text-[10px] font-black text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded-md flex items-center gap-1 shadow-2xs">
                            <Tag className="w-3 h-3 text-amber-700" />
                            <span>
                              {item.discountLabel ||
                                `${Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF`}
                            </span>
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700">
                            (Save ₹{item.originalPrice - item.price})
                          </span>
                        </>
                      )}
                    </div>

                    {/* Stock Status Badge & Quick Stock Controls */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {item.hasStockTracking ? (
                        <>
                          {(item.stockQuantity ?? 0) <= 0 ? (
                            <span className="text-[10px] font-black text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                              <span>Sold Out (0 units)</span>
                            </span>
                          ) : (item.stockQuantity ?? 0) <= (item.lowStockThreshold ?? 5) ? (
                            <span className="text-[10px] font-black text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>Low Stock: Only {item.stockQuantity} left</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                              <Package className="w-3 h-3 text-sky-600" />
                              <span>Stock: {item.stockQuantity} portions</span>
                            </span>
                          )}

                          {/* Quick Stock Bumper */}
                          <div className="inline-flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                            <button
                              type="button"
                              onClick={() => handleQuickAdjustItemStock(item, -1)}
                              disabled={(item.stockQuantity ?? 0) <= 0}
                              className="w-5 h-5 bg-white hover:bg-slate-200 text-slate-700 font-black rounded text-[10px] flex items-center justify-center transition disabled:opacity-40"
                              title="Decrease 1 portion"
                            >
                              -1
                            </button>
                            <span className="text-[10px] font-black text-slate-800 px-1">
                              {item.stockQuantity ?? 0}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuickAdjustItemStock(item, 5)}
                              className="px-1.5 h-5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded text-[10px] flex items-center justify-center transition shadow-2xs"
                              title="Quick add +5 portions"
                            >
                              +5
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickAdjustItemStock(item, 10)}
                              className="px-1.5 h-5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded text-[10px] flex items-center justify-center transition shadow-2xs"
                              title="Quick add +10 portions"
                            >
                              +10
                            </button>
                          </div>
                        </>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-slate-400" />
                          <span>Unlimited Stock</span>
                        </span>
                      )}
                    </div>

                    {item.variants && item.variants.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 mt-1.5">
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          ⚡ {item.variants.length} Variants
                        </span>
                        {item.variants.map((v) => (
                          <span
                            key={v.id}
                            className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded"
                          >
                            {v.name}: ₹{v.price}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions (Availability Toggle + Edit + Delete) */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => toggleMenuItemAvailability(item.id)}
                      className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase transition ${
                        item.isAvailable
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                      title="Toggle Customer Availability"
                    >
                      {item.isAvailable ? 'In Stock ✓' : 'Out of Stock'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          setFoodModalState({
                            isOpen: true,
                            mode: 'edit',
                            item: item,
                          })
                        }
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                        title="Edit Dish & Photo"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDeleteFoodItem(item)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Food Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Categories Management (with Add/Edit/Delete & Category Photo Upload) */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-600" />
                <h3 className="font-heading font-black text-lg text-slate-900">
                  Menu Categories Management
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Vendors have full access to add, edit, and delete categories with high-definition photo uploads
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCategoryModalState({ isOpen: true, mode: 'add', category: null })}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/20 transition flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Category</span>
            </button>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const countForThisRestaurant = myMenuItems.filter(
                (m) => m.category === cat.name
              ).length;
              const isOwnVendorCategory = cat.restaurantId === restaurant.id;

              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
                >
                  <div className="relative h-32 w-full overflow-hidden bg-slate-100">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover hover:scale-105 transition"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                      <div>
                        <h4 className="text-sm font-black text-white font-heading leading-tight drop-shadow-xs">
                          {cat.name}
                        </h4>
                        <span className="text-[10px] font-bold text-slate-200">
                          {countForThisRestaurant} dishes in your menu
                        </span>
                      </div>
                    </div>

                    {isOwnVendorCategory && (
                      <span className="absolute top-2 right-2 bg-purple-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
                        Custom Outlet Category
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-500">
                      ID: #{cat.id}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setCategoryModalState({
                            isOpen: true,
                            mode: 'edit',
                            category: cat,
                          })
                        }
                        className="px-2.5 py-1 text-xs font-bold text-purple-700 hover:bg-purple-100 rounded-lg transition flex items-center gap-1"
                        title="Edit Category & Photo"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteCatItem(cat)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Restaurant Opening & Closing Timings & Weekly Schedule */}
      {activeTab === 'timings' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Live Kitchen Status Hero Banner */}
          <div className={`rounded-3xl p-6 border transition shadow-sm ${
            currentOpenStatus.isOpen
              ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white border-emerald-500/40'
              : 'bg-gradient-to-br from-rose-950 via-slate-900 to-rose-900 text-white border-rose-500/40'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 shadow ${
                    currentOpenStatus.isOpen ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>{currentOpenStatus.isOpen ? 'Kitchen Currently OPEN' : 'Kitchen Currently CLOSED'}</span>
                  </span>

                  <span className="bg-white/10 backdrop-blur-xs text-slate-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/10">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Current Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </span>

                  {autoOpenClose && (
                    <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
                      ⚡ Auto-Timer Active
                    </span>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-white">
                  {currentOpenStatus.statusText}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentOpenStatus.nextScheduleText}. Customers can place orders through the app whenever your kitchen is open.
                </p>
              </div>

              {/* Instant Manual Toggle Action */}
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col items-center sm:items-end gap-2 text-center sm:text-right">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Emergency / Manual Override
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const newIsOpen = !restaurant.isOpen;
                    updateRestaurant(restaurant.id, { isOpen: newIsOpen });
                    addNotification(
                      'Kitchen Override Applied',
                      `Kitchen manually switched to ${newIsOpen ? 'Open' : 'Closed'}.`,
                      'system'
                    );
                  }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 shadow-lg active:scale-95 ${
                    restaurant.isOpen
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  <Power className="w-4 h-4" />
                  <span>{restaurant.isOpen ? 'Close Kitchen Immediately' : 'Open Kitchen Immediately'}</span>
                </button>
                <span className="text-[10px] text-slate-400">
                  {restaurant.isOpen ? 'Overrides auto schedule to pause incoming orders' : 'Overrides auto schedule to accept incoming orders now'}
                </span>
              </div>
            </div>
          </div>

          {/* Configuration Card: Standard Operating Hours & Mode */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h4 className="font-heading font-black text-base text-slate-900 flex items-center gap-2">
                  <Sun className="w-5 h-5 text-amber-500" />
                  <span>Standard Operating Hours & Kitchen Automation</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set daily opening and closing hours for your restaurant kitchen and delivery operations
                </p>
              </div>

              {/* Auto Schedule Switch */}
              <label className="flex items-center gap-3 cursor-pointer bg-slate-50 hover:bg-slate-100 p-2.5 px-4 rounded-2xl border border-slate-200 transition">
                <input
                  type="checkbox"
                  checked={autoOpenClose}
                  onChange={(e) => setAutoOpenClose(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block">
                    Automated Kitchen Timer
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {autoOpenClose ? 'Kitchen automatically opens/closes on schedule' : 'Manual control mode'}
                  </span>
                </div>
              </label>
            </div>

            {/* Standard Daily Opening & Closing Hours Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Opening Time */}
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-emerald-600" />
                    <span>Standard Opening Time</span>
                  </label>
                  <span className="text-xs font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-lg border border-emerald-200">
                    {formatTime12h(openingTime)}
                  </span>
                </div>
                <input
                  type="time"
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                  className="w-full text-sm font-black p-2.5 bg-white border border-emerald-300 rounded-xl focus:outline-emerald-600 text-slate-900"
                />
                <p className="text-[11px] text-slate-500">
                  Time when morning preparation begins and customer orders start being accepted.
                </p>
              </div>

              {/* Closing Time */}
              <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                    <Moon className="w-4 h-4 text-purple-600" />
                    <span>Standard Closing Time</span>
                  </label>
                  <span className="text-xs font-bold text-purple-800 bg-white px-2 py-0.5 rounded-lg border border-purple-200">
                    {formatTime12h(closingTime)}
                  </span>
                </div>
                <input
                  type="time"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                  className="w-full text-sm font-black p-2.5 bg-white border border-purple-300 rounded-xl focus:outline-purple-600 text-slate-900"
                />
                <p className="text-[11px] text-slate-500">
                  Last call for food orders. Kitchen closes for sanitization and wrap-up.
                </p>
              </div>
            </div>

            {/* Quick Presets Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Popular Timing Presets:</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleApplyPresetTimings('09:00', '23:00')}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 text-xs font-bold rounded-lg transition"
                >
                  9:00 AM – 11:00 PM (Standard)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetTimings('08:00', '22:00')}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 text-xs font-bold rounded-lg transition"
                >
                  8:00 AM – 10:00 PM (Breakfast)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetTimings('11:00', '00:00')}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 text-xs font-bold rounded-lg transition"
                >
                  11:00 AM – 12:00 AM (Lunch to Midnight)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetTimings('18:00', '04:00')}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 text-xs font-bold rounded-lg transition"
                >
                  6:00 PM – 4:00 AM (Late Night Cloud Kitchen)
                </button>
              </div>

              <button
                type="button"
                onClick={handleApplyToAllDays}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center gap-1.5 active:scale-95"
              >
                <span>Apply These Hours to All 7 Days ↓</span>
              </button>
            </div>
          </div>

          {/* Day-Wise Weekly Schedule Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-heading font-black text-base text-slate-900 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-emerald-600" />
                  <span>Day-wise Weekly Schedule</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customize different operating hours or mark specific days off (e.g. Tuesday cleaning break or weekend extended hours)
                </p>
              </div>

              <span className="text-xs text-slate-400 font-medium">
                Highlighted badge indicates today's live day
              </span>
            </div>

            {/* Schedule Rows */}
            <div className="space-y-2.5">
              {DAYS_OF_WEEK.map((dayName) => {
                const dayItem = schedule.find((s) => s.day === dayName) || {
                  day: dayName,
                  isOpen: true,
                  openTime: openingTime,
                  closeTime: closingTime,
                };

                const dayIndex = new Date().getDay();
                const dayMap: Record<number, string> = {
                  0: 'Sunday',
                  1: 'Monday',
                  2: 'Tuesday',
                  3: 'Wednesday',
                  4: 'Thursday',
                  5: 'Friday',
                  6: 'Saturday',
                };
                const isToday = dayMap[dayIndex] === dayName;

                return (
                  <div
                    key={dayName}
                    className={`p-3.5 rounded-2xl border transition flex flex-wrap items-center justify-between gap-3 ${
                      isToday
                        ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-300 shadow-2xs'
                        : dayItem.isOpen
                        ? 'bg-slate-50/60 border-slate-200'
                        : 'bg-rose-50/40 border-rose-200 opacity-80'
                    }`}
                  >
                    {/* Day name & status switch */}
                    <div className="flex items-center gap-3 min-w-[160px]">
                      <button
                        type="button"
                        onClick={() => handleToggleDay(dayName)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs transition active:scale-90 ${
                          dayItem.isOpen
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                        title={dayItem.isOpen ? 'Click to mark this day closed' : 'Click to mark this day open'}
                      >
                        {dayItem.isOpen ? '✓' : '✕'}
                      </button>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-slate-900">{dayName}</span>
                          {isToday && (
                            <span className="bg-emerald-600 text-white text-[9px] font-black uppercase px-2 py-0.2 rounded-full">
                              TODAY
                            </span>
                          )}
                        </div>
                        <span className={`text-[10px] font-bold block ${
                          dayItem.isOpen ? 'text-emerald-700' : 'text-rose-600'
                        }`}>
                          {dayItem.isOpen ? 'Accepting Orders' : 'Outlet Closed All Day'}
                        </span>
                      </div>
                    </div>

                    {/* Hours Pickers */}
                    {dayItem.isOpen ? (
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-[11px] font-semibold text-slate-400">Opens:</span>
                          <input
                            type="time"
                            value={dayItem.openTime}
                            onChange={(e) => handleUpdateDay(dayName, 'openTime', e.target.value)}
                            className="p-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-emerald-500"
                          />
                          <span className="text-[10px] font-bold text-slate-500">
                            ({formatTime12h(dayItem.openTime)})
                          </span>
                        </div>

                        <span className="text-slate-300 font-bold">→</span>

                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-[11px] font-semibold text-slate-400">Closes:</span>
                          <input
                            type="time"
                            value={dayItem.closeTime}
                            onChange={(e) => handleUpdateDay(dayName, 'closeTime', e.target.value)}
                            className="p-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-emerald-500"
                          />
                          <span className="text-[10px] font-bold text-slate-500">
                            ({formatTime12h(dayItem.closeTime)})
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-rose-600 font-bold bg-white px-3 py-1.5 rounded-xl border border-rose-200">
                        Kitchen closed on {dayName}s (Weekly Day Off)
                      </div>
                    )}

                    {/* Summary badge */}
                    <div className="text-right min-w-[130px]">
                      {dayItem.isOpen ? (
                        <span className="text-xs font-black text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                          {formatTime12h(dayItem.openTime)} - {formatTime12h(dayItem.closeTime)}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleDay(dayName)}
                          className="text-xs font-bold text-emerald-700 hover:underline"
                        >
                          Enable {dayName} →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Save Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Changes will take effect immediately in the customer portal and delivery dispatch system.</span>
              </div>

              <div className="flex items-center gap-3">
                {isTimingSaved && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Timings Saved Successfully ✓</span>
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleSaveTimings}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center gap-2 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Timings & Schedule</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Finances & Payouts Console */}
      {activeTab === 'finances' && (
        <RestaurantEarningsHub
          restaurant={restaurant}
          orders={orders}
          payoutRequests={payoutRequests}
          onRequestPayoutOpen={() => setIsPayoutModalOpen(true)}
          onCancelPayout={(payoutId) => cancelPayoutRequest(payoutId)}
          onNavigateToKyc={() => setActiveTab('kyc')}
        />
      )}

      {/* Tab 5: KYC & Compliance Documents (with Restaurant Photo, FSSAI, GSTIN/UDYAM, PAN, Aadhaar) */}
      {activeTab === 'kyc' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-600" />
                <h3 className="font-heading font-black text-lg text-slate-900">
                  KYC & Statutory Compliance Documents
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Verified certificates and identity proofs approved by Super Admin
              </p>
            </div>

            <span
              className={`text-xs font-black uppercase px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${
                restaurant.kyc.verified
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{restaurant.kyc.verified ? 'Verified & Active ✓' : 'Verification Under Review'}</span>
            </span>
          </div>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. Restaurant Photo */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  Restaurant Photo
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Uploaded ✓
                </span>
              </div>
              <div
                onClick={() =>
                  setDocPreview({
                    isOpen: true,
                    title: 'Restaurant Outlet & Kitchen Photo',
                    url: restaurant.kyc.restaurantPhotoUrl || restaurant.bannerImage || restaurant.logo,
                  })
                }
                className="h-28 rounded-xl overflow-hidden bg-slate-200 cursor-pointer relative group"
              >
                <img
                  src={restaurant.kyc.restaurantPhotoUrl || restaurant.bannerImage || restaurant.logo}
                  alt="Restaurant"
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white text-xs font-bold gap-1">
                  <Eye className="w-4 h-4" />
                  <span>Click to Inspect</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Storefront facade & hygienic kitchen inspection photo
              </p>
            </div>

            {/* 2. FSSAI Certificate */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                  FSSAI Food License
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Verified ✓
                </span>
              </div>
              <div
                onClick={() =>
                  setDocPreview({
                    isOpen: true,
                    title: 'FSSAI Food License Certificate',
                    url: restaurant.kyc.fssaiDocUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
                    number: restaurant.kyc.fssaiNumber,
                  })
                }
                className="h-28 rounded-xl overflow-hidden bg-white border border-slate-200 cursor-pointer relative group p-3 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400">14-Digit License</span>
                  <p className="font-mono font-black text-slate-900 text-sm">{restaurant.kyc.fssaiNumber}</p>
                </div>
                <div className="flex items-center justify-between text-[11px] text-emerald-700 font-bold">
                  <span>Certificate Attached</span>
                  <Eye className="w-4 h-4 group-hover:scale-110 transition" />
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Food Safety and Standards Authority of India Registration
              </p>
            </div>

            {/* 3. GSTIN Registration / UDYAM Certificate */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                  GSTIN / UDYAM Certificate
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Verified ✓
                </span>
              </div>
              <div
                onClick={() =>
                  setDocPreview({
                    isOpen: true,
                    title: 'GSTIN / UDYAM Registration Document',
                    url: restaurant.kyc.gstDocUrl || restaurant.kyc.udyamDocUrl || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
                    number: restaurant.kyc.gstinNumber,
                  })
                }
                className="h-28 rounded-xl overflow-hidden bg-white border border-slate-200 cursor-pointer relative group p-3 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400">GSTIN / MSME Reg</span>
                  <p className="font-mono font-black text-slate-900 text-xs truncate">{restaurant.kyc.gstinNumber}</p>
                </div>
                <div className="flex items-center justify-between text-[11px] text-emerald-700 font-bold">
                  <span>UDYAM: {restaurant.kyc.udyamNumber || 'N/A'}</span>
                  <Eye className="w-4 h-4 group-hover:scale-110 transition" />
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                GSTIN Form REG-06 or Central UDYAM MSME Registration
              </p>
            </div>

            {/* 4. Entity PAN Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                  PAN Card Document
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Verified ✓
                </span>
              </div>
              <div
                onClick={() =>
                  setDocPreview({
                    isOpen: true,
                    title: 'Entity Income Tax PAN Card',
                    url: restaurant.kyc.panDocUrl || 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&auto=format&fit=crop&q=80',
                    number: restaurant.kyc.panNumber,
                  })
                }
                className="h-28 rounded-xl overflow-hidden bg-white border border-slate-200 cursor-pointer relative group p-3 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400">10-Digit PAN</span>
                  <p className="font-mono font-black text-slate-900 text-sm">{restaurant.kyc.panNumber}</p>
                </div>
                <div className="flex items-center justify-between text-[11px] text-emerald-700 font-bold">
                  <span>PAN Copy Attached</span>
                  <Eye className="w-4 h-4 group-hover:scale-110 transition" />
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Proprietor or Partnership Entity Income Tax PAN
              </p>
            </div>

            {/* 5. Aadhaar Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Aadhaar Card Document
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Verified ✓
                </span>
              </div>
              <div
                onClick={() =>
                  setDocPreview({
                    isOpen: true,
                    title: 'Owner / Signatory Aadhaar Card',
                    url: restaurant.kyc.aadhaarDocUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
                    number: restaurant.kyc.aadhaarNumber || 'Masked Aadhaar',
                  })
                }
                className="h-28 rounded-xl overflow-hidden bg-white border border-slate-200 cursor-pointer relative group p-3 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400">UIDAI Aadhaar</span>
                  <p className="font-mono font-black text-slate-900 text-sm">
                    {restaurant.kyc.aadhaarNumber || '7829 4019 2831'}
                  </p>
                </div>
                <div className="flex items-center justify-between text-[11px] text-emerald-700 font-bold">
                  <span>Front & Back Attached</span>
                  <Eye className="w-4 h-4 group-hover:scale-110 transition" />
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                UIDAI Government Aadhaar Document for Identity Verification
              </p>
            </div>

            {/* 6. Bank Account Details */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  Settlement Bank
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Active ✓
                </span>
              </div>
              <div className="h-28 rounded-xl bg-white border border-slate-200 p-3 flex flex-col justify-between">
                <div>
                  <p className="font-bold text-slate-900 text-xs">{restaurant.kyc.bankAccount.bankName}</p>
                  <p className="font-mono text-slate-600 text-[11px] mt-0.5">
                    A/C: {restaurant.kyc.bankAccount.accountNumber}
                  </p>
                  <p className="font-mono text-slate-400 text-[10px]">
                    IFSC: {restaurant.kyc.bankAccount.ifscCode}
                  </p>
                </div>
                <p className="text-[10px] text-slate-500 truncate">
                  Holder: {restaurant.kyc.bankAccount.accountHolderName}
                </p>
              </div>
              <p className="text-[11px] text-slate-500">
                Commercial current/savings account for direct weekly payouts
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Real Google Map & Delivery Radius */}
      {activeTab === 'map' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-black text-lg text-slate-900">
                      Live Google Maps & Delivery Coverage Radius
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Google Maps Platform Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    High-precision geo-pinning for food preparation dispatch, delivery partner routing & customer coverage
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!navigator.geolocation) {
                      alert('Geolocation not supported');
                      return;
                    }
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        const lat = Number(pos.coords.latitude.toFixed(5));
                        const lng = Number(pos.coords.longitude.toFixed(5));
                        updateRestaurant(restaurant.id, {
                          coordinates: { lat, lng },
                        });
                        addNotification(
                          'GPS Synchronized',
                          `Kitchen GPS coordinates updated to ${lat}, ${lng} via device sensors.`,
                          'system'
                        );
                      },
                      (err) => {
                        alert('Could not fetch GPS: ' + err.message);
                      },
                      { enableHighAccuracy: true }
                    );
                  }}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition flex items-center gap-1.5 shadow-2xs active:scale-95"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Auto-Detect Current GPS</span>
                </button>
              </div>
            </div>

            {/* Geo Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">
                  Current Latitude
                </span>
                <span className="font-mono font-black text-slate-800 text-sm">
                  {restaurant.coordinates?.lat ?? 12.9352}° N
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">
                  Current Longitude
                </span>
                <span className="font-mono font-black text-slate-800 text-sm">
                  {restaurant.coordinates?.lng ?? 77.6245}° E
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">
                  Service Delivery Radius
                </span>
                <span className="font-bold text-emerald-700 text-sm">
                  5.0 km Guaranteed
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">
                  Outlet Address
                </span>
                <span className="font-bold text-slate-800 text-xs truncate block" title={restaurant.address}>
                  {restaurant.address}
                </span>
              </div>
            </div>

            {/* Real Google Map Component */}
            <div className="pt-2">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Interactive Real Google Map (Click on map to reposition kitchen coordinates)</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  Includes street view, satellite imagery & delivery radius circle
                </span>
              </div>

              <LiveMap
                centerLat={restaurant.coordinates?.lat || 12.9352}
                centerLng={restaurant.coordinates?.lng || 77.6245}
                restaurantCoords={{
                  lat: restaurant.coordinates?.lat || 12.9352,
                  lng: restaurant.coordinates?.lng || 77.6245,
                  name: restaurant.name,
                }}
                interactive={true}
                height="450px"
                radiusKm={5}
                zoom={14}
                onLocationSelect={(loc) => {
                  updateRestaurant(restaurant.id, {
                    coordinates: { lat: loc.lat, lng: loc.lng },
                    address: loc.address || restaurant.address,
                  });
                  addNotification(
                    'Kitchen Pin Updated',
                    `New coordinates saved: ${loc.lat}, ${loc.lng}. Address: ${loc.address}`,
                    'system'
                  );
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 1. Accept Order Modal with Preparation Time Selector */}
      {acceptModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black font-heading text-slate-900">
                    Accept Order #{acceptModalOrder.id}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Customer: {acceptModalOrder.customerName} ({acceptModalOrder.customerPhone})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAcceptModalOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dishes Summary */}
            <div className="bg-slate-50 p-3 rounded-2xl space-y-1.5 text-xs text-slate-700 max-h-40 overflow-y-auto">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Ordered Items ({acceptModalOrder.items.length})
              </span>
              {acceptModalOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${it.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                    <span className="font-medium text-slate-800">{it.quantity}x {it.name}</span>
                  </span>
                  <span className="font-bold text-slate-900">₹{it.price * it.quantity}</span>
                </div>
              ))}
              <div className="pt-1.5 mt-1 border-t border-slate-200/80 flex justify-between font-black text-slate-900 text-xs">
                <span>Total Bill</span>
                <span>₹{acceptModalOrder.totalAmount}</span>
              </div>
              {/* Financial Auto Deduction Breakdown for Incoming Order */}
              {(() => {
                const modalGross = acceptModalOrder.itemTotal || 0;
                const modalComm = Math.round((modalGross * commRate) / 100);
                const modalNet = Math.max(0, modalGross - modalComm);

                return (
                  <div className="pt-2 mt-1 border-t border-slate-200/60 bg-emerald-50/60 p-2.5 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600 text-[11px]">
                      <span>Food Gross:</span>
                      <span className="font-mono font-bold">₹{modalGross}</span>
                    </div>
                    <div className="flex justify-between text-amber-700 text-[11px]">
                      <span>Platform Auto-Commission (-{commRate}%):</span>
                      <span className="font-mono font-bold">-₹{modalComm}</span>
                    </div>
                    <div className="flex justify-between text-emerald-800 font-bold pt-1 border-t border-emerald-200/80">
                      <span>Net Vendor Credit on Delivery:</span>
                      <span className="font-mono font-black text-emerald-700 text-sm">+₹{modalNet}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Preparation Time Picker */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>Kitchen Preparation Time</span>
                <span className="text-emerald-700 font-bold normal-case text-xs">
                  {acceptPrepMinutes} minutes
                </span>
              </label>
              <p className="text-[11px] text-slate-500">
                Choose the estimated minutes required to cook and package this feast:
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[15, 20, 25, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setAcceptPrepMinutes(mins)}
                    className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1 ${
                      acceptPrepMinutes === mins
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{mins} mins</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAcceptModalOrder(null)}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  acceptOrderByRestaurant(acceptModalOrder.id, acceptPrepMinutes);
                  setAcceptModalOrder(null);
                }}
                className="flex-2 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Accept ({acceptPrepMinutes} mins)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Reject Order Modal with Structured Reasons & Refund Warning */}
      {rejectModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-rose-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                  <AlertOctagon className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black font-heading text-rose-950">
                    Reject Order #{rejectModalOrder.id}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Customer: {rejectModalOrder.customerName} • Total ₹{rejectModalOrder.totalAmount}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRejectModalOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Please specify why this order cannot be prepared. This reason will be communicated directly to the customer:
            </p>

            {/* Structured Reasons List */}
            <div className="space-y-2">
              {[
                'Kitchen overloaded with orders',
                'Key dish ingredients out of stock',
                'Restaurant closing early / Maintenance',
                'Special cooking instructions cannot be fulfilled',
                'Delivery distance too far / Kitchen capacity reached',
                'Other custom reason',
              ].map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                    rejectReason === r
                      ? 'bg-rose-50 border-rose-400 font-bold text-rose-950'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    value={r}
                    checked={rejectReason === r}
                    onChange={() => setRejectReason(r)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>

            {/* Custom Reason Text Box if "Other custom reason" selected */}
            {rejectReason === 'Other custom reason' && (
              <textarea
                value={customRejectReason}
                onChange={(e) => setCustomRejectReason(e.target.value)}
                placeholder="Type specific explanation for customer and platform admins..."
                rows={2}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-rose-500"
              />
            )}

            {/* Refund & Notification Notice */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-amber-600" />
                <span>Automatic 100% Customer Refund</span>
              </p>
              <p className="text-amber-800">
                The order will be immediately cancelled. An automatic full refund of <strong>₹{rejectModalOrder.totalAmount}</strong> will be initiated to the customer's {rejectModalOrder.paymentMethod.toUpperCase()} account.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectModalOrder(null)}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={() => {
                  const finalReason =
                    rejectReason === 'Other custom reason' && customRejectReason.trim()
                      ? customRejectReason.trim()
                      : rejectReason;
                  rejectOrderByRestaurant(rejectModalOrder.id, finalReason);
                  setRejectModalOrder(null);
                }}
                className="flex-2 py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-95"
              >
                <XCircle className="w-4 h-4" />
                <span>Confirm Rejection & Refund</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Food Item Add / Edit Modal */}
      <FoodItemModal
        isOpen={foodModalState.isOpen}
        mode={foodModalState.mode}
        item={foodModalState.item}
        restaurantId={restaurant.id}
        categories={categories}
        onClose={() => setFoodModalState({ isOpen: false, mode: 'add', item: null })}
        onSave={handleSaveFoodItem}
        onOpenAddCategory={() => {
          setFoodModalState({ isOpen: false, mode: 'add', item: null });
          setCategoryModalState({ isOpen: true, mode: 'add', category: null });
        }}
      />

      {/* Category Add / Edit Modal */}
      <CategoryModal
        isOpen={categoryModalState.isOpen}
        mode={categoryModalState.mode}
        category={categoryModalState.category}
        restaurantId={restaurant.id}
        onClose={() => setCategoryModalState({ isOpen: false, mode: 'add', category: null })}
        onSave={handleSaveCategory}
      />

      {/* Delete Food Item Confirm Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteFoodItem)}
        title="Delete Food Item from Menu"
        message="Are you sure you want to permanently delete this dish from your restaurant menu?"
        itemName={deleteFoodItem ? `${deleteFoodItem.name} (₹${deleteFoodItem.price})` : undefined}
        onClose={() => setDeleteFoodItem(null)}
        onConfirm={handleConfirmDeleteFood}
      />

      {/* Delete Category Confirm Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteCatItem)}
        title="Delete Menu Category"
        message="Are you sure you want to remove this category? Dishes assigned to it will remain in your catalog."
        itemName={deleteCatItem ? deleteCatItem.name : undefined}
        onClose={() => setDeleteCatItem(null)}
        onConfirm={handleConfirmDeleteCategory}
      />

      {/* Document Fullscreen Preview Modal */}
      {docPreview && docPreview.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-heading">
                    {docPreview.title}
                  </h3>
                  {docPreview.number && (
                    <p className="text-[11px] font-mono text-slate-500">
                      Document Reg No: {docPreview.number}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDocPreview(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto bg-slate-50 flex items-center justify-center min-h-[320px]">
              <div className="max-h-[60vh] overflow-hidden rounded-2xl border border-slate-200 shadow-md">
                <img
                  src={docPreview.url}
                  alt={docPreview.title}
                  className="max-h-[58vh] w-auto object-contain mx-auto"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between">
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Super Admin Verified Document</span>
              </span>
              <button
                type="button"
                onClick={() => setDocPreview(null)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restaurant Payout & Withdrawal Modal */}
      <RestaurantPayoutModal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        restaurant={restaurant}
        availablePayout={availablePayout}
        grossSales={totalGrossSales}
        autoCommission={totalAutoCommission}
        netEarningsLifetime={netEarningsLifetime}
        settledPayouts={settledPayouts}
        onRequestPayout={(params) => requestPayout(params)}
      />
    </div>
  );
};
