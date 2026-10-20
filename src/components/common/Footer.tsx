import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Heart, MapPin, Phone, Mail, Smartphone, Laptop, Globe, QrCode } from 'lucide-react';

export const Footer: React.FC = () => {
  const {
    brandSettings,
    setActivePortal,
    setCustomerView,
    setSelectedPolicy,
    setSelectedRestaurantId,
    zones,
    setAdminInitialTab,
  } = useApp();

  const handleOpenPolicy = (policy: string) => {
    setSelectedPolicy(policy);
    setCustomerView('policy');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-900 mt-16 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              {brandSettings.logoUrl ? (
                <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center overflow-hidden shrink-0 shadow">
                  <img
                    src={brandSettings.logoUrl}
                    alt={brandSettings.brandName}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-black text-base shadow">
                  L
                </div>
              )}
              <span className="text-xl font-black font-heading tracking-tight text-white">
                {brandSettings.brandName}
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              {brandSettings.tagline}. Hyperlocal delivery of gourmet delicacies from verified culinary kitchens.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>100% FSSAI Certified Partners</span>
            </div>
          </div>

          {/* Col 2: Company & Legal */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Company
            </h4>
            <ul className="space-y-2">
              {brandSettings.companyPages?.aboutUs?.enabled !== false && (
                <li>
                  <button
                    onClick={() => handleOpenPolicy('about')}
                    className="hover:text-white transition"
                  >
                    {brandSettings.companyPages?.aboutUs?.heading || 'About Us'}
                  </button>
                </li>
              )}
              {brandSettings.companyPages?.contactSupport?.enabled !== false && (
                <li>
                  <button
                    onClick={() => handleOpenPolicy('contact')}
                    className="hover:text-white transition"
                  >
                    {brandSettings.companyPages?.contactSupport?.heading || 'Contact & Support'}
                  </button>
                </li>
              )}
              {brandSettings.companyPages?.privacyPolicy?.enabled !== false && (
                <li>
                  <button
                    onClick={() => handleOpenPolicy('privacy')}
                    className="hover:text-white transition"
                  >
                    {brandSettings.companyPages?.privacyPolicy?.heading || 'Privacy Policy'}
                  </button>
                </li>
              )}
              {brandSettings.companyPages?.termsConditions?.enabled !== false && (
                <li>
                  <button
                    onClick={() => handleOpenPolicy('terms')}
                    className="hover:text-white transition"
                  >
                    {brandSettings.companyPages?.termsConditions?.heading || 'Terms & Conditions'}
                  </button>
                </li>
              )}
              {brandSettings.companyPages?.refundCancellation?.enabled !== false && (
                <li>
                  <button
                    onClick={() => handleOpenPolicy('refund')}
                    className="hover:text-white transition"
                  >
                    {brandSettings.companyPages?.refundCancellation?.heading || 'Refund & Cancellation Policy'}
                  </button>
                </li>
              )}
              {/* Custom Admin Added Pages */}
              {brandSettings.companyPages?.customPages
                ?.filter((p) => p.enabled !== false)
                .map((cp) => (
                  <li key={cp.id}>
                    <button
                      onClick={() => handleOpenPolicy(cp.slug)}
                      className="hover:text-white transition flex items-center gap-1"
                    >
                      <span>{cp.title}</span>
                    </button>
                  </li>
                ))}
            </ul>
          </div>

          {/* Col 3: Ecosystem Portals */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Platform Portals
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    setActivePortal('customer');
                    setCustomerView('home');
                    setSelectedRestaurantId(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition"
                >
                  Customer Food Ordering
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActivePortal('customer');
                    setCustomerView('quick_commerce');
                    setSelectedRestaurantId(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition text-amber-300 font-bold flex items-center gap-1"
                >
                  <span>⚡ Likart Mart (10m Groceries)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActivePortal('restaurant');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition text-emerald-400"
                >
                  Restaurant & Vendor Hub
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActivePortal('delivery');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition text-blue-400"
                >
                  Delivery Fleet Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActivePortal('mart_manager');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition text-emerald-400 font-bold flex items-center gap-1.5"
                >
                  <span>🏬 Likart Mart Store Manager Login</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setAdminInitialTab('likart_mart');
                    setActivePortal('admin');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition text-emerald-300 font-bold flex items-center gap-1.5"
                >
                  <span>⚡ Likart Mart Super Admin Login</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setAdminInitialTab('overview');
                    setActivePortal('admin');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition text-orange-300 font-bold flex items-center gap-1.5"
                >
                  <span>🍔 Likart Food Super Admin Login</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Delivery Hubs */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Gourmet Delivery Zones
            </h4>
            {zones && zones.filter((z) => z.isActive).length > 0 ? (
              <div className="space-y-1.5 text-xs text-slate-400">
                {zones
                  .filter((z) => z.isActive)
                  .slice(0, 6)
                  .map((z) => (
                    <p key={z.id}>• {z.name}</p>
                  ))}
              </div>
            ) : (
              <div className="space-y-1 text-xs text-slate-400">
                <p>Live Coverage Area</p>
                <p className="text-[11px] text-slate-500">Service zones configured in Super Admin Console</p>
              </div>
            )}
            <div className="pt-2 text-[11px] text-slate-500">
              Operating Hours: 24 Hours • 7 Days
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} {brandSettings.brandName}. All rights reserved. Built for speed, safety, and flavour.
          </div>
          <div className="flex items-center gap-3">
            <span>Razorpay • Cashfree • PhonePe • COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
