import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Phone,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  UtensilsCrossed,
  Store,
  Lock,
  Gift,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    loginCustomer,
    registerCustomer,
    allCustomers,
    setActivePortal,
    setAdminInitialTab,
    addNotification,
  } = useApp();

  // Mobile number input
  const [phoneLogin, setPhoneLogin] = useState('');
  // Customer Name (required only once for new customers)
  const [name, setName] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Screen OTP states
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState(['', '', '', '']);
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Clean phone number helper
  const cleanPhone = phoneLogin.replace(/\D/g, '');

  // Check if existing customer matches the entered phone number
  const existingCustomer = React.useMemo(() => {
    if (cleanPhone.length < 10) return null;
    return allCustomers.find((c) => {
      const cClean = c.phone.replace(/\D/g, '');
      return cClean.endsWith(cleanPhone.slice(-10)) || cClean === cleanPhone;
    }) || null;
  }, [cleanPhone, allCustomers]);

  const isNewCustomer = cleanPhone.length === 10 && !existingCustomer;

  // Auto focus first OTP input when OTP screen opens
  useEffect(() => {
    if (otpSent) {
      const timer = setTimeout(() => {
        document.getElementById('customer-otp-0')?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [otpSent]);

  if (!isAuthModalOpen) return null;

  const generateAndDispatchOtp = (targetPhone: string) => {
    // Generate secure 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);
    setOtpValue(['', '', '', '']);
    setCopiedOtp(false);
    addNotification('On-Screen OTP Generated', `Your verification code is ${code}`, 'system');
  };

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    // For new customers, ask name once
    if (isNewCustomer && !name.trim()) {
      setError('Welcome! Please enter your full name for instant account setup.');
      return;
    }

    generateAndDispatchOtp(cleanPhone);
  };

  const handleAutoFillOtp = () => {
    if (generatedOtp && generatedOtp.length === 4) {
      const digits = generatedOtp.split('');
      setOtpValue(digits);
      setError('');
      // Auto verify on 1-click
      performVerification(digits.join(''));
    }
  };

  const handleCopyOtp = () => {
    if (generatedOtp) {
      navigator.clipboard?.writeText(generatedOtp);
      setCopiedOtp(true);
      setTimeout(() => setCopiedOtp(false), 2000);
    }
  };

  const handlePasteOtp = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (paste) {
      const newOtp = ['', '', '', ''];
      paste.split('').forEach((char, idx) => {
        if (idx < 4) newOtp[idx] = char;
      });
      setOtpValue(newOtp);
      if (paste.length === 4) {
        performVerification(paste);
      } else {
        const nextIdx = Math.min(paste.length, 3);
        document.getElementById(`customer-otp-${nextIdx}`)?.focus();
      }
    }
  };

  const performVerification = (codeToVerify: string) => {
    setError('');
    if (codeToVerify.length < 4) {
      setError('Please enter all 4 digits of the OTP code.');
      return;
    }
    if (codeToVerify !== generatedOtp) {
      setError('Invalid OTP code. Please check the on-screen code above and retry.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      if (existingCustomer) {
        // Sign into existing account with permanent access
        const loginRes = loginCustomer(cleanPhone, '', true);
        setIsLoading(false);
        if (loginRes.success) {
          setIsAuthModalOpen(false);
        } else {
          setError(loginRes.message);
        }
      } else {
        // Auto register new customer with provided name and permanent access
        const customerName = name.trim() || `Customer ${cleanPhone.slice(-4)}`;
        const regRes = registerCustomer({
          name: customerName,
          phone: cleanPhone,
        });
        setIsLoading(false);
        if (regRes.success) {
          setIsAuthModalOpen(false);
        } else {
          setError(regRes.message);
        }
      }
    }, 350);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    performVerification(otpValue.join(''));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden relative">
        {/* Top Header Graphic */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 p-6 text-white relative">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-black text-sm">
              L
            </span>
            <span className="font-extrabold tracking-wider text-xs uppercase opacity-90">
              LIKART SECURE AUTH
            </span>
            <span className="ml-auto mr-7 inline-flex items-center gap-1 text-[10px] font-bold bg-white/15 px-2 py-0.5 rounded-full border border-white/20">
              <Lock className="w-3 h-3 text-emerald-300" />
              <span>Permanent Access</span>
            </span>
          </div>
          <h3 className="text-2xl font-black font-heading">
            {otpSent ? 'Verify On-Screen OTP' : 'Screen OTP Sign In'}
          </h3>
          <p className="text-xs text-orange-100 mt-1">
            {otpSent
              ? 'Enter the 4-digit code displayed below to sign in instantly'
              : 'Password-free authentication with automatic registration for new customers'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-xs text-rose-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!otpSent ? (
            /* STEP 1: MOBILE NUMBER & AUTO-REGISTRATION NAME PROMPT */
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Mobile Phone Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3.5 rounded-l-2xl border border-r-0 border-slate-200 bg-slate-100 text-slate-700 text-xs font-extrabold">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    autoFocus
                    value={phoneLogin}
                    onChange={(e) => {
                      setPhoneLogin(e.target.value.replace(/\D/g, ''));
                      setError('');
                    }}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full text-xs px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-r-2xl focus:outline-orange-500 focus:bg-white font-medium text-slate-900 tracking-wider"
                  />
                </div>
              </div>

              {/* Existing Customer Detected Card */}
              {existingCustomer && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900 animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold">Welcome back, {existingCustomer.name}!</p>
                      <p className="text-[11px] text-emerald-700">Account verified • Instant permanent login</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">
                    Existing User
                  </span>
                </div>
              )}

              {/* New Customer Detected: Ask Name Once & Offer Free ₹100 Welcome Bonus */}
              {isNewCustomer && (
                <div className="space-y-3 p-3.5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-950">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>New Customer Auto Registration</span>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Gift className="w-3 h-3 text-orange-600" />
                      <span>+₹100 Bonus</span>
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      What should we call you? (Full Name) <span className="text-orange-600">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setError('');
                        }}
                        placeholder="Enter your name (e.g. Aarav Sharma)"
                        className="w-full text-xs pl-9 pr-3 py-2.5 bg-white border border-amber-300 rounded-xl focus:outline-orange-500 font-medium text-slate-900"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>One-time name prompt. Your account and login will be permanently saved.</span>
                  </p>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={cleanPhone.length < 10 || (isNewCustomer && !name.trim())}
                className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs rounded-2xl transition shadow-md active:scale-98 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isNewCustomer
                    ? 'Auto Register & Show On-Screen OTP'
                    : 'Generate & Show On-Screen OTP'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center">
                <p className="text-[11px] text-slate-400">
                  ⚡ Zero password hassle. Your login will remain active permanently on this browser.
                </p>
              </div>
            </form>
          ) : (
            /* STEP 2: ON-SCREEN OTP VERIFICATION FLOW */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {/* UPGRADED ON-SCREEN OTP DISPLAY FEATURE */}
              <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 rounded-3xl p-5 text-white shadow-xl shadow-orange-500/20 border border-amber-300/40 text-center relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-sm"></div>

                <div className="flex items-center justify-between gap-2 mb-2 text-[11px] font-bold text-amber-100">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping inline-block"></span>
                    <span>ON-SCREEN VERIFICATION CODE</span>
                  </div>
                  <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-mono">
                    +91 {cleanPhone}
                  </span>
                </div>

                {name && !existingCustomer && (
                  <div className="text-[11px] text-orange-100 mb-1">
                    Auto-registering: <span className="font-extrabold text-white">{name}</span>
                  </div>
                )}

                {/* Prominent OTP Code Showcase */}
                <div className="my-3">
                  <div className="text-[11px] text-orange-100 mb-1.5 font-medium">
                    Your 4-Digit Screen Login Code is:
                  </div>
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-2.5 rounded-2xl border border-white/30 shadow-inner">
                    <span className="text-3xl font-black tracking-[0.4em] font-mono text-white drop-shadow-md">
                      {generatedOtp}
                    </span>
                  </div>
                </div>

                {/* Quick 1-Click Action Buttons */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleAutoFillOtp}
                    className="px-4 py-2 bg-white text-orange-700 hover:bg-orange-50 text-xs font-black rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>1-Click Auto-Fill OTP</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyOtp}
                    className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 active:scale-95"
                  >
                    {copiedOtp ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 4 Digit Input Boxes with full paste and keyboard navigation support */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2 text-center">
                  Enter 4-Digit Verification Code
                </label>
                <div className="flex justify-center gap-3">
                  {[0, 1, 2, 3].map((index) => (
                    <input
                      key={index}
                      id={`customer-otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={otpValue[index] || ''}
                      onPaste={index === 0 ? handlePasteOtp : undefined}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        const newOtp = [...otpValue];
                        newOtp[index] = val;
                        setOtpValue(newOtp);
                        if (val && index < 3) {
                          const nextInput = document.getElementById(`customer-otp-${index + 1}`);
                          nextInput?.focus();
                        }
                        if (val && index === 3) {
                          const completeCode = [...newOtp.slice(0, 3), val].join('');
                          if (completeCode.length === 4) {
                            performVerification(completeCode);
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !otpValue[index] && index > 0) {
                          const prevInput = document.getElementById(`customer-otp-${index - 1}`);
                          prevInput?.focus();
                        }
                      }}
                      className="w-13 h-13 text-center text-2xl font-black bg-slate-50 border-2 border-slate-300 rounded-2xl focus:outline-none focus:border-orange-500 focus:bg-white shadow-xs transition"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-2xl transition shadow-md active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                <span>
                  {isLoading
                    ? 'Verifying & Activating Permanent Login...'
                    : 'Verify & Sign In Permanently'}
                </span>
              </button>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <button
                  type="button"
                  onClick={() => generateAndDispatchOtp(cleanPhone)}
                  className="hover:text-orange-600 font-bold flex items-center gap-1.5 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Generate New OTP</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtpValue(['', '', '', '']);
                    setError('');
                  }}
                  className="hover:text-slate-900 underline font-semibold transition"
                >
                  Change Number / Name
                </button>
              </div>
            </form>
          )}

          {/* Operator & Staff Quick Portals Access */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Staff & Operator Access
              </span>
              <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded">
                Portal Logins
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="grid grid-cols-2 gap-2">
                {/* 1. Likart Food Super Admin */}
                <button
                  type="button"
                  onClick={() => {
                    setIsAuthModalOpen(false);
                    setAdminInitialTab('overview');
                    setActivePortal('admin');
                  }}
                  className="p-2.5 rounded-xl bg-orange-50 hover:bg-orange-100/90 border border-orange-200 text-left transition group active:scale-95"
                >
                  <div className="flex items-center gap-1.5 text-xs font-black text-orange-950">
                    <UtensilsCrossed className="w-3.5 h-3.5 text-orange-600 group-hover:scale-110 transition" />
                    <span>Food Super Admin</span>
                  </div>
                  <p className="text-[10px] text-orange-700 font-semibold mt-0.5">
                    Restaurants &amp; Kitchens
                  </p>
                </button>

                {/* 2. Likart Mart Super Admin */}
                <button
                  type="button"
                  onClick={() => {
                    setIsAuthModalOpen(false);
                    setAdminInitialTab('likart_mart');
                    setActivePortal('admin');
                  }}
                  className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200 text-left transition group active:scale-95"
                >
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 group-hover:scale-110 transition" />
                    <span>Mart Super Admin</span>
                  </div>
                  <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                    Dark Stores &amp; 10m SLAs
                  </p>
                </button>
              </div>

              {/* 3. Likart Mart Store Manager */}
              <button
                type="button"
                onClick={() => {
                  setIsAuthModalOpen(false);
                  setActivePortal('mart_manager');
                }}
                className="w-full p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition flex items-center justify-between group active:scale-95"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
                    <Store className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-800 block">
                      Likart Mart Store Manager
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Dark Store Pod In-Store POS &amp; Inventory PIN Login
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-0.5 transition" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
