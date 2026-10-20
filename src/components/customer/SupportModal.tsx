import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Phone,
  Mail,
  Send,
  CheckCircle,
  MessageSquare,
  Headphones,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export const SupportModal: React.FC = () => {
  const {
    isSupportModalOpen,
    setIsSupportModalOpen,
    createSupportTicket,
    brandSettings,
    orders,
    setCustomerView,
    setCustomerProfileTab,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'ticket' | 'faq' | 'quick_help'>('ticket');
  const [subject, setSubject] = useState('Order delivery delay inquiry');
  const [message, setMessage] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  const [quickHelpFeedback, setQuickHelpFeedback] = useState<string | null>(null);

  if (!isSupportModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;
    createSupportTicket({
      subject,
      message,
      orderId: selectedOrderId || undefined,
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setMessage('');
      setIsSupportModalOpen(false);
    }, 2200);
  };

  const FAQS = [
    {
      q: 'My food delivery is delayed beyond the estimated time. What should I do?',
      a: 'LIKART Care 24/7 tracks all active riders via live GPS. If delayed by more than 15 minutes due to traffic or weather, you automatically receive a delay compensation credit in your wallet or priority dispatch.',
    },
    {
      q: 'What if items are missing or spilled during delivery?',
      a: 'We have a 100% Freshness & Accuracy guarantee. Submit a ticket with the affected item, and our 24/7 Care team will immediately process an instant refund to your original payment method or UPI.',
    },
    {
      q: 'How do I cancel or modify my active order?',
      a: 'Orders can be cancelled before the restaurant kitchen starts preparation (within ~2 minutes of placing). Once cooking begins, contact our 24/7 hotline directly for immediate kitchen intervention.',
    },
    {
      q: 'When will my refunded money reflect in my bank account?',
      a: 'UPI and Wallet refunds reflect instantly (under 15 minutes). Credit/Debit card refunds typically reflect within 2 to 4 business days depending on your bank.',
    },
  ];

  const handleQuickSolution = (issue: string) => {
    switch (issue) {
      case 'rider_status':
        setQuickHelpFeedback(
          'Diagnostic: All active riders are connected via live GPS tracking. Open your Profile -> Past Orders or the top bar "Track Live Order" to see your delivery partner on the real-time map.'
        );
        break;
      case 'spilled_food':
        setSubject('Food quality or packaging issue');
        setMessage('My order arrived in damaged/spilled condition. Requesting immediate replacement or refund credit.');
        setActiveTab('ticket');
        setQuickHelpFeedback(null);
        break;
      case 'missing_dish':
        setSubject('Missing or wrong items in delivery');
        setMessage('Certain items were missing in the sealed bag received from restaurant.');
        setActiveTab('ticket');
        setQuickHelpFeedback(null);
        break;
      case 'payment_deducted':
        setSubject('Payment or refund status');
        setMessage('Payment was debited from account but order status needs verification.');
        setActiveTab('ticket');
        setQuickHelpFeedback(null);
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 p-6 text-white relative shrink-0">
          <button
            onClick={() => setIsSupportModalOpen(false)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
            <span className="font-black text-xs uppercase tracking-wider text-orange-100 bg-white/15 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5" />
              <span>LIKART Care 24/7</span>
            </span>
            <span className="text-[10px] text-emerald-200 font-bold ml-auto hidden sm:inline">
              Round-the-Clock Priority Resolution
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black font-heading tracking-tight">
            How can our 24/7 Care Team assist you?
          </h3>
          <p className="text-xs text-orange-100 mt-1">
            Live executives online. Average resolution time is under 2-4 minutes.
          </p>
        </div>

        {/* 24/7 Emergency Helplines Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 gap-3 text-xs shrink-0">
          <a
            href={`tel:${brandSettings.supportPhone}`}
            className="p-3 bg-white rounded-2xl border border-slate-200 hover:border-orange-400 transition flex items-center gap-2.5 shadow-2xs group"
          >
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl group-hover:scale-105 transition">
              <Phone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                24/7 Priority Phone
              </p>
              <p className="font-extrabold text-slate-900 truncate">{brandSettings.supportPhone}</p>
            </div>
          </a>

          <a
            href={`mailto:${brandSettings.supportEmail}`}
            className="p-3 bg-white rounded-2xl border border-slate-200 hover:border-orange-400 transition flex items-center gap-2.5 shadow-2xs group"
          >
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl group-hover:scale-105 transition">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                24/7 Escalation Email
              </p>
              <p className="font-extrabold text-slate-900 truncate">{brandSettings.supportEmail}</p>
            </div>
          </a>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 px-6 pt-3 gap-2 shrink-0 bg-white">
          <button
            onClick={() => {
              setActiveTab('ticket');
              setQuickHelpFeedback(null);
            }}
            className={`pb-2.5 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'ticket'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Raise 24/7 Ticket</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('quick_help');
              setQuickHelpFeedback(null);
            }}
            className={`pb-2.5 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'quick_help'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Instant Diagnostics</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('faq');
              setQuickHelpFeedback(null);
            }}
            className={`pb-2.5 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'faq'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Quick FAQs</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {submitted ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="font-heading font-black text-lg text-slate-900">
                24/7 Priority Ticket Dispatched!
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Our active operations desk has received your ticket. Updates will appear in your profile notifications and support history.
              </p>
            </div>
          ) : (
            <>
              {/* TAB 1: RAISE TICKET */}
              {activeTab === 'ticket' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Issue Category *
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-orange-500 font-medium"
                    >
                      <option value="Order delivery delay inquiry">Order Delivery Delay / ETA Tracking</option>
                      <option value="Food quality or packaging issue">Food Quality / Temperature / Spilled Packaging</option>
                      <option value="Missing or wrong items in delivery">Missing or Incorrect Dishes in Order</option>
                      <option value="Payment or refund status">Payment Deducted / Refund Reversal Inquiry</option>
                      <option value="Delivery partner contact inquiry">Delivery Partner Calling / Location Help</option>
                      <option value="General inquiry or feedback">Other Query or Suggestions</option>
                    </select>
                  </div>

                  {orders.length > 0 && (
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Select Relevant Order (Optional)
                      </label>
                      <select
                        value={selectedOrderId}
                        onChange={(e) => setSelectedOrderId(e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-orange-500 font-medium"
                      >
                        <option value="">No specific order</option>
                        {orders.map((o) => (
                          <option key={o.id} value={o.id}>
                            Order #{o.id} • {o.restaurantName} (₹{o.totalAmount} • {o.status.replace(/_/g, ' ')})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Describe the problem *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please provide details (e.g. dish name, rider delay, or invoice issue)..."
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-orange-500 focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-98"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit to 24/7 Operations Desk</span>
                  </button>
                </form>
              )}

              {/* TAB 2: INSTANT DIAGNOSTICS */}
              {activeTab === 'quick_help' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500">
                    Click any common query below for an automated instant resolution check:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleQuickSolution('rider_status')}
                      className="p-3 bg-slate-50 border border-slate-200 hover:border-orange-400 rounded-xl text-left text-xs font-bold text-slate-800 transition flex items-center justify-between"
                    >
                      <span>Where is my Delivery Partner?</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickSolution('spilled_food')}
                      className="p-3 bg-slate-50 border border-slate-200 hover:border-orange-400 rounded-xl text-left text-xs font-bold text-slate-800 transition flex items-center justify-between"
                    >
                      <span>Food Arrived Cold or Spilled</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickSolution('missing_dish')}
                      className="p-3 bg-slate-50 border border-slate-200 hover:border-orange-400 rounded-xl text-left text-xs font-bold text-slate-800 transition flex items-center justify-between"
                    >
                      <span>Missing Item in My Package</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickSolution('payment_deducted')}
                      className="p-3 bg-slate-50 border border-slate-200 hover:border-orange-400 rounded-xl text-left text-xs font-bold text-slate-800 transition flex items-center justify-between"
                    >
                      <span>Payment Debited but Pending</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>

                  {quickHelpFeedback && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl text-xs text-orange-950 space-y-2 animate-in fade-in">
                      <div className="flex items-center gap-2 font-bold text-orange-900">
                        <Sparkles className="w-4 h-4 text-orange-600" />
                        <span>Instant Care Assistant Response:</span>
                      </div>
                      <p className="leading-relaxed">{quickHelpFeedback}</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: FAQS */}
              {activeTab === 'faq' && (
                <div className="space-y-3">
                  {FAQS.map((faq, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs"
                    >
                      <h5 className="font-black text-slate-900 flex items-start gap-2">
                        <span className="text-orange-600 font-bold">Q:</span>
                        <span>{faq.q}</span>
                      </h5>
                      <p className="text-slate-600 pl-4 leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Link to Full Profile Care Center */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500 font-medium">Want to track existing tickets?</span>
          <button
            type="button"
            onClick={() => {
              setCustomerProfileTab('care');
              setCustomerView('profile');
              setIsSupportModalOpen(false);
            }}
            className="text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1"
          >
            <span>Open LIKART Care in My Profile</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
