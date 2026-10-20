import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, ShieldCheck, Mail, Phone, MapPin, Clock, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

export const PolicyPages: React.FC = () => {
  const { selectedPolicy, setCustomerView, brandSettings } = useApp();

  const pages = brandSettings.companyPages;

  // Check if standard policy is disabled/deleted
  const isAboutDisabled = pages?.aboutUs?.enabled === false;
  const isContactDisabled = pages?.contactSupport?.enabled === false;
  const isPrivacyDisabled = pages?.privacyPolicy?.enabled === false;
  const isTermsDisabled = pages?.termsConditions?.enabled === false;
  const isRefundDisabled = pages?.refundCancellation?.enabled === false;

  // Check if selected policy is a custom page added by admin
  const customPage = pages?.customPages?.find(
    (p) => p.slug === selectedPolicy || p.id === selectedPolicy
  );

  const renderDisabledNotice = (pageTitle: string) => (
    <div className="py-12 text-center space-y-4">
      <div className="w-16 h-16 mx-auto bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-200">
        <AlertCircle className="w-8 h-8" />
      </div>
      <div>
        <h2 className="text-xl font-black text-slate-900">{pageTitle} Notice</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
          This document is currently archived or being revised by the platform administration. Please check back later.
        </p>
      </div>
      <button
        onClick={() => setCustomerView('home')}
        className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
      >
        Return to Restaurant Menu
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <button
        onClick={() => setCustomerView('home')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-orange-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Ordering</span>
      </button>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xs space-y-6 text-slate-700 leading-relaxed text-sm">
        {/* 1. ABOUT US */}
        {selectedPolicy === 'about' && (
          isAboutDisabled ? (
            renderDisabledNotice('About Us')
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
                  {pages?.aboutUs?.heading || `About ${brandSettings.brandName}`}
                </h1>
                <p className="text-base text-slate-600 font-medium">
                  {pages?.aboutUs?.subheading || brandSettings.tagline}
                </p>
              </div>

              <div className="space-y-4 text-slate-700 leading-relaxed">
                <p>
                  {pages?.aboutUs?.story || (
                    <>
                      Founded with the singular mission of bringing Michelin-quality flavours and street food icons straight to your doorstep, <strong>{brandSettings.brandName}</strong> is a premier on-demand culinary network.
                    </>
                  )}
                </p>
                <p>
                  {pages?.aboutUs?.standards ||
                    'We partner exclusively with hygienic, FSSAI-certified master kitchens and culinary artisans. Every order is tracked in real-time with Google Maps Platform precision, sealed with tamper-proof packaging, and delivered by our trained, insured delivery fleet.'}
                </p>
              </div>

              {/* Standard + Custom Highlight Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-200">
                  <span className="text-2xl font-black text-orange-600 font-heading">
                    {pages?.aboutUs?.stat1Number || '25 Mins'}
                  </span>
                  <p className="text-xs text-slate-600 mt-1">
                    {pages?.aboutUs?.stat1Label || 'Average delivery time across zones'}
                  </p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <span className="text-2xl font-black text-emerald-600 font-heading">
                    {pages?.aboutUs?.stat2Number || '100%'}
                  </span>
                  <p className="text-xs text-slate-600 mt-1">
                    {pages?.aboutUs?.stat2Label || 'FSSAI verified kitchens & hygiene checked'}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
                  <span className="text-2xl font-black text-purple-600 font-heading">
                    {pages?.aboutUs?.stat3Number || '24/7'}
                  </span>
                  <p className="text-xs text-slate-600 mt-1">
                    {pages?.aboutUs?.stat3Label || 'Dedicated customer care & chat resolution'}
                  </p>
                </div>

                {/* Additional Admin-Added Metric Cards */}
                {pages?.aboutUs?.customStats?.map((stat) => (
                  <div key={stat.id} className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                    <span className="text-2xl font-black text-blue-600 font-heading">
                      {stat.number}
                    </span>
                    <p className="text-xs text-slate-600 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Custom Sections Added By Admin */}
              {pages?.aboutUs?.customSections && pages.aboutUs.customSections.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  {pages.aboutUs.customSections.map((sec) => (
                    <div key={sec.id} className="space-y-2">
                      <h3 className="text-lg font-bold text-slate-900">{sec.title}</h3>
                      <div className="whitespace-pre-line text-slate-700 leading-relaxed">
                        {sec.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        )}

        {/* 2. CONTACT & SUPPORT */}
        {selectedPolicy === 'contact' && (
          isContactDisabled ? (
            renderDisabledNotice('Contact & Support')
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
                  {pages?.contactSupport?.heading || `Contact ${brandSettings.brandName} Headquarters`}
                </h1>
                <p className="text-slate-600">
                  {pages?.contactSupport?.description ||
                    'Have questions regarding orders, partnerships, or fleet onboarding? Reach out anytime.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <Phone className="w-5 h-5 text-orange-600 mb-2" />
                  <h4 className="font-bold text-xs text-slate-900 uppercase">Customer Helpline</h4>
                  <p className="font-bold text-slate-800">{pages?.contactSupport?.phone || brandSettings.supportPhone}</p>
                  <p className="text-[11px] text-slate-400">
                    {pages?.contactSupport?.operatingHours || 'Toll-free 24/7'}
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <Mail className="w-5 h-5 text-blue-600 mb-2" />
                  <h4 className="font-bold text-xs text-slate-900 uppercase">Email Care</h4>
                  <p className="font-bold text-slate-800">{pages?.contactSupport?.email || brandSettings.supportEmail}</p>
                  <p className="text-[11px] text-slate-400">Response within 2 hours</p>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <MapPin className="w-5 h-5 text-emerald-600 mb-2" />
                  <h4 className="font-bold text-xs text-slate-900 uppercase">Headquarters</h4>
                  <p className="font-bold text-slate-800">
                    {pages?.contactSupport?.address || brandSettings.headquartersAddress || 'Bengaluru Central'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {pages?.contactSupport?.cityStateZip || 'Karnataka, India - 560034'}
                  </p>
                </div>

                {/* Additional Admin-Added Channels */}
                {pages?.contactSupport?.customChannels?.map((channel) => (
                  <div key={channel.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 mb-2" />
                    <h4 className="font-bold text-xs text-slate-900 uppercase">{channel.title}</h4>
                    <p className="font-bold text-slate-800">{channel.detail}</p>
                    {channel.subtext && <p className="text-[11px] text-slate-400">{channel.subtext}</p>}
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {/* 3. PRIVACY POLICY */}
        {selectedPolicy === 'privacy' && (
          isPrivacyDisabled ? (
            renderDisabledNotice('Privacy Policy')
          ) : (
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
                {pages?.privacyPolicy?.heading || 'Privacy & Data Protection Policy'}
              </h1>
              <p className="text-xs text-slate-500">
                Last updated: {pages?.privacyPolicy?.lastUpdated || 'October 2026'}
              </p>
              <div className="space-y-3 whitespace-pre-line text-slate-700">
                {pages?.privacyPolicy?.content ||
                  `At ${brandSettings.brandName}, we take the confidentiality and privacy of our customers, restaurant partners, and delivery professionals with utmost gravity.\n\n1. Location & GPS Data\nWe collect foreground and background geolocation coordinates exclusively during active delivery operations to provide accurate distance estimations, auto-detect nearest kitchens, and enable live Google Maps route tracking.\n\n2. Payment Security\nAll payment credentials (credit/debit cards, UPI VPA, net banking) are handled by certified, PCI-DSS Level 1 compliant partners (Razorpay, Cashfree, PhonePe). We do not store plain text card credentials.`}
              </div>

              {pages?.privacyPolicy?.customSections?.map((sec) => (
                <div key={sec.id} className="pt-4 border-t border-slate-100 space-y-2">
                  <h3 className="text-base font-bold text-slate-900">{sec.title}</h3>
                  <div className="whitespace-pre-line text-slate-700 leading-relaxed">
                    {sec.content}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* 4. TERMS & CONDITIONS */}
        {selectedPolicy === 'terms' && (
          isTermsDisabled ? (
            renderDisabledNotice('Terms & Conditions')
          ) : (
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
                {pages?.termsConditions?.heading || 'Terms & Conditions of Service'}
              </h1>
              <p className="text-xs text-slate-500">
                Effective Date: {pages?.termsConditions?.effectiveDate || 'October 2026'}
              </p>
              <div className="space-y-3 whitespace-pre-line text-slate-700">
                {pages?.termsConditions?.content ||
                  `By accessing the ${brandSettings.brandName} application or web portal, you agree to comply with our commercial terms and community standards.\n\n1. Ordering & Acceptance\nOrders placed on the platform constitute an offer to purchase culinary items from our independent restaurant vendors. The contract is executed upon restaurant confirmation.\n\n2. Delivery Verification OTP\nFor consumer protection, orders require oral disclosure of the 4-digit numeric verification OTP displayed on the tracking screen to the delivery partner upon arrival.`}
              </div>

              {pages?.termsConditions?.customSections?.map((sec) => (
                <div key={sec.id} className="pt-4 border-t border-slate-100 space-y-2">
                  <h3 className="text-base font-bold text-slate-900">{sec.title}</h3>
                  <div className="whitespace-pre-line text-slate-700 leading-relaxed">
                    {sec.content}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* 5. REFUND & CANCELLATION */}
        {selectedPolicy === 'refund' && (
          isRefundDisabled ? (
            renderDisabledNotice('Refund & Cancellation Policy')
          ) : (
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
                {pages?.refundCancellation?.heading || 'Cancellation & Refund Policy'}
              </h1>
              <p className="text-xs text-slate-500">
                {pages?.refundCancellation?.subtitle || 'Fair Customer Protection'}
              </p>
              <div className="space-y-3 whitespace-pre-line text-slate-700">
                {pages?.refundCancellation?.content ||
                  `We understand plans can change. Here is our transparent cancellation policy:\n\n• Immediate Cancellations: Free full 100% cancellation before the restaurant starts food preparation.\n\n• Quality Assurance Refunds: In the rare event of food spill, incorrect items, or extreme delivery delays, full or partial instant refunds are credited within 24-48 hours.\n\n• Refund Routing: Online payments are credited back to the source bank account, credit card, or UPI wallet with an official transaction reference.`}
              </div>

              {pages?.refundCancellation?.customSections?.map((sec) => (
                <div key={sec.id} className="pt-4 border-t border-slate-100 space-y-2">
                  <h3 className="text-base font-bold text-slate-900">{sec.title}</h3>
                  <div className="whitespace-pre-line text-slate-700 leading-relaxed">
                    {sec.content}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* 6. ADMIN-ADDED CUSTOM COMPANY PAGES */}
        {customPage && (
          !customPage.enabled ? (
            renderDisabledNotice(customPage.title)
          ) : (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {customPage.category || 'Company Document'}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
                  {customPage.title}
                </h1>
                {customPage.subtitle && (
                  <p className="text-base text-slate-600 font-medium">{customPage.subtitle}</p>
                )}
                {customPage.lastUpdated && (
                  <p className="text-xs text-slate-400">Last updated: {customPage.lastUpdated}</p>
                )}
              </div>

              <div className="space-y-3 whitespace-pre-line text-slate-700 leading-relaxed pt-2">
                {customPage.content}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
