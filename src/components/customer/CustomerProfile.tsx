import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  MapPin,
  Clock,
  Heart,
  FileText,
  RotateCcw,
  Star,
  Plus,
  Trash2,
  CheckCircle,
  HelpCircle,
  Edit,
  Settings,
  ShieldCheck,
  Save,
  Phone,
  Mail,
  Image as ImageIcon,
  Bell,
  Headphones,
  Check,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
  Sparkles,
  Send,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { SavedAddress } from '../../types';
import { AddressSaveModal } from './AddressSaveModal';
import { PhotoUploadInput } from '../common/PhotoUploadInput';

export const CustomerProfile: React.FC = () => {
  const {
    customerUser,
    orders,
    restaurants,
    setSelectedRestaurantId,
    setCustomerView,
    addToCart,
    setIsCartOpen,
    setIsTrackingModalOpen,
    setActiveTrackingOrderId,
    addNotification,
    setIsSupportModalOpen,
    supportTickets,
    createSupportTicket,
    currentLocation,
    setCurrentLocation,
    zones,
    setCurrentZone,
    deleteCustomerAddress,
    updateCustomerProfile,
    customerProfileTab,
    setCustomerProfileTab,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    deleteNotification,
    brandSettings,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'orders' | 'addresses' | 'favorites' | 'notifications' | 'care' | 'settings' | 'tickets'
  >(customerProfileTab || 'orders');

  // Sync with global customerProfileTab if updated from Navbar dropdown
  useEffect(() => {
    if (customerProfileTab) {
      setActiveTab(customerProfileTab === 'tickets' ? 'care' : customerProfileTab);
    }
  }, [customerProfileTab]);

  const handleTabChange = (
    tab: 'orders' | 'addresses' | 'favorites' | 'notifications' | 'care' | 'settings' | 'tickets'
  ) => {
    setActiveTab(tab);
    setCustomerProfileTab(tab);
  };

  const [ratingModalOrder, setRatingModalOrder] = useState<string | null>(null);
  const [stars, setStars] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);

  // Profile Form States
  const [profileName, setProfileName] = useState(customerUser?.name || '');
  const [profileEmail, setProfileEmail] = useState(customerUser?.email || '');
  const [profilePhone, setProfilePhone] = useState(customerUser?.phone || '');
  const [profileAvatar, setProfileAvatar] = useState(customerUser?.avatar || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Notifications Filter & Preferences
  const [notifFilter, setNotifFilter] = useState<'all' | 'order'>('all');
  const [clearedNotice, setClearedNotice] = useState(false);
  const [notifChannels, setNotifChannels] = useState({
    smsTracking: true,
    whatsAppUpdates: true,
    promoOffers: false,
    emailReceipts: true,
  });

  // LIKART Care 24/7 Form States
  const [careSubject, setCareSubject] = useState('Order delivery delay inquiry');
  const [careMessage, setCareMessage] = useState('');
  const [careOrderId, setCareOrderId] = useState('');
  const [careSubmitted, setCareSubmitted] = useState(false);
  const [careDiagnosticResult, setCareDiagnosticResult] = useState<string | null>(null);

  useEffect(() => {
    if (customerUser) {
      setProfileName(customerUser.name);
      setProfileEmail(customerUser.email);
      setProfilePhone(customerUser.phone);
      setProfileAvatar(customerUser.avatar || '');
    }
  }, [customerUser]);

  if (!customerUser) {
    return (
      <div className="py-20 text-center space-y-4">
        <User className="w-16 h-16 text-slate-300 mx-auto" />
        <h3 className="text-xl font-black text-slate-800 font-heading">
          Please Sign In
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Log in with your mobile number to view past orders, addresses, and wishlist.
        </p>
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      alert('Please enter your full name.');
      return;
    }
    if (!profileEmail.trim() || !profileEmail.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }

    setIsSavingProfile(true);
    setTimeout(() => {
      updateCustomerProfile({
        name: profileName.trim(),
        email: profileEmail.trim(),
        phone: profilePhone.trim(),
        avatar: profileAvatar.trim(),
      });
      setIsSavingProfile(false);
      addNotification('Profile Saved', 'Your profile details have been saved permanently to your account.', 'system');
    }, 300);
  };

  const handleReorder = (orderId: string) => {
    const ord = orders.find((o) => o.id === orderId);
    if (!ord) return;
    addNotification('Items Added', 'Order items added to your cart for reordering!', 'order');
    setIsCartOpen(true);
  };

  const handleTrackOrder = (orderId: string) => {
    setActiveTrackingOrderId(orderId);
    setIsTrackingModalOpen(true);
  };

  const submitReview = () => {
    addNotification('Review Submitted', `Thank you for rating ${stars} stars!`, 'system');
    setRatingModalOrder(null);
    setReviewText('');
  };

  const handleCareTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!careMessage.trim()) return;
    createSupportTicket({
      subject: careSubject,
      message: careMessage,
      orderId: careOrderId || undefined,
    });
    setCareSubmitted(true);
    setTimeout(() => {
      setCareSubmitted(false);
      setCareMessage('');
      setCareOrderId('');
    }, 2500);
  };

  const handleRunDiagnostic = (type: string) => {
    switch (type) {
      case 'rider_gps':
        setCareDiagnosticResult(
          'Diagnostic: Rider dispatch telemetry active. If an order is in progress, the assigned partner coordinates are updated every 3 seconds.'
        );
        break;
      case 'cold_food':
        setCareSubject('Food quality or packaging issue');
        setCareMessage('Food arrived cold / packaging was opened. Requesting instant replacement or 100% wallet credit.');
        setCareDiagnosticResult(
          'Selected: Food temperature/packaging defect. Fill the brief description below to dispatch an automated refund request.'
        );
        break;
      case 'missing_dish':
        setCareSubject('Missing or wrong items in delivery');
        setCareMessage('An item was missing from the bag delivered by restaurant.');
        setCareDiagnosticResult(
          'Selected: Missing item claim. Please submit the ticket with order number for direct item refund.'
        );
        break;
      case 'refund_status':
        setCareDiagnosticResult(
          'Diagnostic: UPI refunds are instantaneous (<15 minutes). Netbanking/cards take 2-4 business days according to RBI guidelines.'
        );
        break;
    }
  };

  const userOrders = orders.filter((o) => o.customerId === customerUser.id || true);
  const favoriteRestaurants = restaurants.filter((r) => customerUser.favorites?.includes(r.id));
  const userTickets = supportTickets.filter((t) => t.userId === customerUser.id);
  // Customer notifications (exclude System Alerts from customer portal)
  const customerNotifications = notifications.filter((n) => n.type !== 'system');
  const unreadCount = customerNotifications.filter((n) => !n.read).length;

  const filteredNotifications = customerNotifications.filter((n) => {
    if (notifFilter === 'order') return n.type === 'order';
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={customerUser.avatar}
              alt={customerUser.name}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-orange-500/20"
            />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-600 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                {customerUser.name}
              </h2>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Verified Foodie</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
              <span>{customerUser.phone}</span>
              <span>•</span>
              <span>{customerUser.email}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* LIKART Care 24/7 button */}
          <button
            onClick={() => handleTabChange('care')}
            className="px-4 py-2 bg-gradient-to-r from-orange-500/10 to-amber-500/10 hover:from-orange-500/20 hover:to-amber-500/20 text-orange-700 font-black text-xs rounded-xl border border-orange-200 transition flex items-center gap-2"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Headphones className="w-4 h-4 text-orange-600" />
            <span>LIKART Care 24/7</span>
          </button>

          <button
            onClick={() => handleTabChange('settings')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => handleTabChange('orders')}
          className={`flex-1 py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Orders ({userOrders.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('addresses')}
          className={`flex-1 py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'addresses'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Addresses ({customerUser.addresses.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('favorites')}
          className={`flex-1 py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'favorites'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Wishlist ({favoriteRestaurants.length})</span>
        </button>

        {/* NOTIFICATIONS TAB (MOVED TO AFTER LOGIN PROFILE) */}
        <button
          onClick={() => handleTabChange('notifications')}
          className={`flex-1 py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap relative ${
            activeTab === 'notifications'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'notifications'
                  ? 'bg-white text-orange-600'
                  : 'bg-orange-600 text-white'
              }`}
            >
              {unreadCount}
            </span>
          )}
        </button>

        {/* LIKART CARE 24/7 TAB */}
        <button
          onClick={() => handleTabChange('care')}
          className={`flex-1 py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'care'
              ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>LIKART Care 24/7</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </button>

        <button
          onClick={() => handleTabChange('settings')}
          className={`flex-1 py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. NOTIFICATIONS TAB (AFTER-LOGIN PROFILE FEATURE) */}
      {/* ========================================================= */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black font-heading text-slate-900">
                    Account Alerts & Order Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live real-time alerts regarding kitchen status, rider GPS tracking, refunds & deals.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => markAllNotificationsRead()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mark All as Read</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearNotifications();
                    setClearedNotice(true);
                    setTimeout(() => setClearedNotice(false), 3500);
                  }}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl transition flex items-center gap-1.5 active:scale-95"
                  title="Clear all alerts and notifications"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </div>
            </div>

            {/* Clear All Confirmation Banner */}
            {clearedNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center justify-between animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold">All notifications have been cleared from your account!</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold">Inbox Zero</span>
              </div>
            )}

            {/* Filter Chips */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              <button
                onClick={() => setNotifFilter('all')}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition ${
                  notifFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({customerNotifications.length})
              </button>
              <button
                onClick={() => setNotifFilter('order')}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition ${
                  notifFilter === 'order'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Orders ({customerNotifications.filter((n) => n.type === 'order').length})
              </button>
            </div>

            {/* Notifications List */}
            <div className="space-y-2.5">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <Bell className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">No notifications to display</p>
                  <p className="text-xs text-slate-400">
                    You're all caught up! New order dispatches and updates will appear here.
                  </p>
                </div>
              ) : (
                filteredNotifications.map((n, idx) => (
                  <div
                    key={`${n.id || 'notif'}-${idx}`}
                    onClick={() => markNotificationRead(n.id)}
                    className={`p-4 rounded-2xl border transition flex items-start justify-between gap-3 cursor-pointer ${
                      n.read
                        ? 'bg-white border-slate-200/80 hover:border-slate-300'
                        : 'bg-orange-50/70 border-orange-200 shadow-2xs hover:bg-orange-50'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                          n.type === 'order'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {n.type === 'order' ? (
                          <FileText className="w-4 h-4" />
                        ) : (
                          <Bell className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-slate-900">{n.title}</h4>
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-orange-600 inline-block"></span>
                          )}
                          <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(n.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0"
                      title="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Notification Delivery Preferences Card */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Delivery Channel Preferences
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-100 transition">
                  <span className="font-semibold text-slate-700">SMS Live Tracking Updates</span>
                  <input
                    type="checkbox"
                    checked={notifChannels.smsTracking}
                    onChange={(e) =>
                      setNotifChannels({ ...notifChannels, smsTracking: e.target.checked })
                    }
                    className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                  />
                </label>
                <label className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-100 transition">
                  <span className="font-semibold text-slate-700">WhatsApp Rider Arrival Alerts</span>
                  <input
                    type="checkbox"
                    checked={notifChannels.whatsAppUpdates}
                    onChange={(e) =>
                      setNotifChannels({ ...notifChannels, whatsAppUpdates: e.target.checked })
                    }
                    className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                  />
                </label>
                <label className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-100 transition">
                  <span className="font-semibold text-slate-700">Special Gourmet Discounts</span>
                  <input
                    type="checkbox"
                    checked={notifChannels.promoOffers}
                    onChange={(e) =>
                      setNotifChannels({ ...notifChannels, promoOffers: e.target.checked })
                    }
                    className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                  />
                </label>
                <label className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-100 transition">
                  <span className="font-semibold text-slate-700">Tax Invoice PDF Emailing</span>
                  <input
                    type="checkbox"
                    checked={notifChannels.emailReceipts}
                    onChange={(e) =>
                      setNotifChannels({ ...notifChannels, emailReceipts: e.target.checked })
                    }
                    className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. LIKART CARE 24/7 TAB */}
      {/* ========================================================= */}
      {activeTab === 'care' && (
        <div className="space-y-6">
          {/* 24/7 Round-the-clock Hero Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="font-black text-xs uppercase tracking-wider text-purple-300">
                    ROUND-THE-CLOCK PRIORITY ASSISTANCE
                  </span>
                </div>
                <h3 className="text-2xl font-black font-heading text-white">
                  LIKART Care 24/7 Resolution Desk
                </h3>
                <p className="text-xs text-slate-300 max-w-lg">
                  Direct connection to emergency customer service officers, kitchen managers, and live rider dispatch coordinators.
                </p>
              </div>

              {/* 24/7 Helplines buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href={`tel:${brandSettings.supportPhone}`}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2 active:scale-95"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call 24/7 Toll-Free</span>
                </a>
                <a
                  href={`mailto:${brandSettings.supportEmail}`}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email Escalations</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Resolution Diagnostic Center */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-heading font-black text-sm text-slate-900">
                  Instant Self-Service Diagnostics
                </h4>
                <p className="text-xs text-slate-500">
                  Select a common situation below for instant resolution guidelines:
                </p>
              </div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Instant Auto-Resolution</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => handleRunDiagnostic('rider_gps')}
                className="p-3.5 bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 rounded-2xl text-left transition group space-y-1"
              >
                <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-orange-600 shadow-2xs font-bold text-xs">
                  GPS
                </div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-orange-600">
                  Rider Location & Delay
                </div>
                <div className="text-[11px] text-slate-500">Check active rider telemetry</div>
              </button>

              <button
                type="button"
                onClick={() => handleRunDiagnostic('cold_food')}
                className="p-3.5 bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 rounded-2xl text-left transition group space-y-1"
              >
                <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-orange-600 shadow-2xs font-bold text-xs">
                  HOT
                </div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-orange-600">
                  Cold or Damaged Food
                </div>
                <div className="text-[11px] text-slate-500">Fast replacement / credit</div>
              </button>

              <button
                type="button"
                onClick={() => handleRunDiagnostic('missing_dish')}
                className="p-3.5 bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 rounded-2xl text-left transition group space-y-1"
              >
                <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-orange-600 shadow-2xs font-bold text-xs">
                  PKG
                </div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-orange-600">
                  Missing Dish in Parcel
                </div>
                <div className="text-[11px] text-slate-500">Direct item refund check</div>
              </button>

              <button
                type="button"
                onClick={() => handleRunDiagnostic('refund_status')}
                className="p-3.5 bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 rounded-2xl text-left transition group space-y-1"
              >
                <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-orange-600 shadow-2xs font-bold text-xs">
                  UPI
                </div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-orange-600">
                  Refund Reversal Timeline
                </div>
                <div className="text-[11px] text-slate-500">Bank processing status</div>
              </button>
            </div>

            {careDiagnosticResult && (
              <div className="p-4 bg-orange-50/80 border border-orange-200 rounded-2xl text-xs text-orange-950 space-y-1 animate-in fade-in">
                <span className="font-bold text-orange-900 block flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                  LIKART Care Diagnostic:
                </span>
                <p>{careDiagnosticResult}</p>
              </div>
            )}
          </div>

          {/* Raise a 24/7 Priority Support Ticket Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h4 className="font-heading font-black text-base text-slate-900">
                Log a 24/7 Priority Support Ticket
              </h4>
              <p className="text-xs text-slate-500">
                Directly alerts our active shift supervisor for immediate callback or kitchen resolution.
              </p>
            </div>

            {careSubmitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 text-xs text-emerald-900">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                <h5 className="font-bold text-sm">Priority Ticket Raised Successfully!</h5>
                <p>
                  Your ticket is actively routed to our duty manager. Updates will appear in your ticket history below.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCareTicketSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Issue Topic *
                    </label>
                    <select
                      value={careSubject}
                      onChange={(e) => setCareSubject(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-orange-500 font-medium"
                    >
                      <option value="Order delivery delay inquiry">Order Delivery Delay / Rider Inquiry</option>
                      <option value="Food quality or packaging issue">Food Quality or Spilled Packaging</option>
                      <option value="Missing or wrong items in delivery">Missing or Incorrect Items</option>
                      <option value="Payment or refund status">Payment Deducted / Refund Reversal</option>
                      <option value="Delivery partner contact inquiry">Rider Contact / Navigation Help</option>
                      <option value="General inquiry or feedback">Other Assistance</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Related Order (Optional)
                    </label>
                    <select
                      value={careOrderId}
                      onChange={(e) => setCareOrderId(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-orange-500 font-medium"
                    >
                      <option value="">No specific order</option>
                      {orders.map((o) => (
                        <option key={o.id} value={o.id}>
                          Order #{o.id} • {o.restaurantName} (₹{o.totalAmount})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Describe your issue in detail *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={careMessage}
                    onChange={(e) => setCareMessage(e.target.value)}
                    placeholder="Explain what happened so our 24/7 Care team can take immediate action..."
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-orange-500 focus:bg-white font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 active:scale-98"
                >
                  <Send className="w-4 h-4" />
                  <span>Send to 24/7 Care Desk</span>
                </button>
              </form>
            )}
          </div>

          {/* Ticket History */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
            <h4 className="font-heading font-black text-sm text-slate-900">
              My Support Ticket History ({userTickets.length})
            </h4>

            {userTickets.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No active or resolved support tickets.</p>
            ) : (
              <div className="space-y-3">
                {userTickets.map((tck) => (
                  <div
                    key={tck.id}
                    className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-500">#{tck.id}</span>
                        <span className="font-bold text-xs text-slate-900">{tck.subject}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          tck.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {tck.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{tck.message}</p>
                    {tck.reply && (
                      <div className="p-3 bg-white border border-emerald-200 rounded-xl text-xs text-slate-800 space-y-1">
                        <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          Official LIKART Care Response:
                        </span>
                        <p className="text-slate-700">{tck.reply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. ORDERS TAB */}
      {/* ========================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {userOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Orders Placed Yet</h3>
              <p className="text-xs text-slate-500">
                Explore gourmet culinary outlets around your delivery zone!
              </p>
              <button
                onClick={() => setCustomerView('home')}
                className="px-5 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-orange-500 transition"
              >
                Browse Restaurants
              </button>
            </div>
          ) : (
            userOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4 transition hover:border-slate-300"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-heading font-black text-sm text-slate-900">
                      Order #{ord.id}
                    </span>
                    <span className="text-xs text-slate-400">{ord.createdAt}</span>
                    {ord.paymentMethod === 'cod' ? (
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                          ord.paymentStatus === 'completed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        Pay on Delivery {ord.paymentStatus === 'completed' ? '• Paid ✓' : '• Pending Doorstep Pay'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                        {ord.paymentMethod}
                      </span>
                    )}
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      ord.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ord.status === 'cancelled'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {ord.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{ord.restaurantName}</h4>
                    <p className="text-xs text-slate-500">
                      {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </p>
                    <p className="text-xs font-black text-slate-900 mt-1">₹{ord.totalAmount}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTrackOrder(ord.id)}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
                    >
                      Track Order
                    </button>
                    <button
                      onClick={() => handleReorder(ord.id)}
                      className="px-3.5 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold text-xs rounded-xl border border-orange-200 transition flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reorder</span>
                    </button>
                    <button
                      onClick={() => setRatingModalOrder(ord.id)}
                      className="p-2 text-slate-400 hover:text-amber-500 rounded-xl hover:bg-slate-50 transition"
                      title="Rate Order"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. SAVED ADDRESSES TAB */}
      {/* ========================================================= */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Permanent Saved Addresses</h3>
            <button
              onClick={() => {
                setEditingAddress(null);
                setIsAddressModalOpen(true);
              }}
              className="px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customerUser.addresses.map((addr) => (
              <div
                key={addr.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                    {addr.type.toUpperCase()} • {addr.title}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingAddress(addr);
                        setIsAddressModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-orange-600 rounded-lg hover:bg-orange-50 transition"
                      title="Edit Address"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteCustomerAddress(addr.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Delete Address"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-0.5">
                  <p className="font-bold text-slate-800">{addr.flat}</p>
                  <p>{addr.area}</p>
                  {addr.landmark && <p className="text-slate-500">Landmark: {addr.landmark}</p>}
                  <p className="text-slate-500">{addr.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. WISHLIST TAB */}
      {/* ========================================================= */}
      {activeTab === 'favorites' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {favoriteRestaurants.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 text-xs">
              No favorite outlets added yet. Click the heart icon on any restaurant to save!
            </div>
          ) : (
            favoriteRestaurants.map((rest) => (
              <div
                key={rest.id}
                onClick={() => {
                  setSelectedRestaurantId(rest.id);
                  setCustomerView('restaurant_detail');
                }}
                className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs cursor-pointer hover:shadow-md transition flex items-center gap-3.5"
              >
                <img
                  src={rest.bannerImage || rest.logo}
                  alt={rest.name}
                  className="w-16 h-16 rounded-2xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-heading font-black text-sm text-slate-900 truncate">
                    {rest.name}
                  </h4>
                  <p className="text-xs text-slate-500 truncate">{rest.cuisine.join(', ')}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-white" />
                      {rest.rating}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 font-semibold">{rest.deliveryTimeMins} mins</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. SETTINGS TAB */}
      {/* ========================================================= */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black font-heading text-slate-900">
                Personal Profile & Account Settings
              </h3>
              <p className="text-xs text-slate-500">
                Update and permanently save your account credentials and personal details
              </p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Permanent Cloud Sync Active</span>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full text-xs pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-orange-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Email Address (For Tax Invoices & Order Receipts)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full text-xs pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-orange-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Primary Registered Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full text-xs pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-orange-500 font-medium"
                />
              </div>
            </div>

            <div>
              <PhotoUploadInput
                label="Profile Avatar Picture"
                value={profileAvatar}
                onChange={(url) => setProfileAvatar(url)}
                helperText="Upload your profile avatar photo (PNG, JPG, WEBP, GIF, SVG, AVIF, HEIC)"
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rate Order Modal */}
      {ratingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-black font-heading text-slate-900 text-center">
              Rate Your Meal Experience
            </h3>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setStars(star)}
                  className="p-1 hover:scale-110 transition"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= stars
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <textarea
              placeholder="What did you love? Tell the chef & delivery rider..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-orange-500"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setRatingModalOrder(null)}
                className="flex-1 py-2 text-xs text-slate-500 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                className="flex-1 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Address Save Modal */}
      <AddressSaveModal
        isOpen={isAddressModalOpen}
        onClose={() => {
          setIsAddressModalOpen(false);
          setEditingAddress(null);
        }}
        editingAddress={editingAddress}
      />
    </div>
  );
};
