import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentUploadCard } from '../common/DocumentUploadCard';
import { LiveSelfieCaptureModal } from '../common/LiveSelfieCaptureModal';
import {
  Bike,
  ShieldCheck,
  Upload,
  Camera,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Navigation,
  RefreshCw,
  Eye,
  FileCheck,
  Sparkles
} from 'lucide-react';

interface DeliveryOnboardingProps {
  onBackToCustomer: () => void;
  onGoToDashboard: () => void;
}

export const DeliveryOnboarding: React.FC<DeliveryOnboardingProps> = ({
  onBackToCustomer,
  onGoToDashboard,
}) => {
  const { registerDeliveryPartner, zones, addNotification } = useApp();

  const [step, setStep] = useState(1);
  const [showSelfieModal, setShowSelfieModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    dob: '',
    email: '',
    phone: '',
    password: '',
    zoneId: zones[0]?.id || 'zone-1',
    vehicleType: 'Motorcycle' as const,
    vehicleNumber: '',
    aadhaarNumber: '',
    panNumber: '',
    drivingLicenseNumber: '',
    rcNumber: '',
    payoutUpiOrBank: '',
    // Document Uploads
    selfieUrl: '',
    aadhaarDocUrl: '',
    aadhaarDocName: '',
    dlDocUrl: '',
    dlDocName: '',
    rcDocUrl: '',
    rcDocName: '',
    panDocUrl: '',
    panDocName: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerDeliveryPartner({
      name: formData.name,
      email: formData.email,
      phone: `+91 ${formData.phone}`,
      password: formData.password || 'rider123',
      avatar: formData.selfieUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      zoneId: formData.zoneId,
      isOnline: true,
      currentLocation: { lat: 12.9352, lng: 77.6245 },
      kyc: {
        fatherName: formData.fatherName,
        dob: formData.dob,
        aadhaarNumber: formData.aadhaarNumber,
        aadhaarDocUrl: formData.aadhaarDocUrl,
        panNumber: formData.panNumber,
        panDocUrl: formData.panDocUrl,
        drivingLicenseNumber: formData.drivingLicenseNumber,
        dlDocUrl: formData.dlDocUrl,
        rcNumber: formData.rcNumber,
        rcDocUrl: formData.rcDocUrl,
        selfieUrl: formData.selfieUrl,
        vehicleType: formData.vehicleType,
        vehicleNumber: formData.vehicleNumber,
        payoutUpiOrBank: formData.payoutUpiOrBank,
        verified: false,
      },
    });

    setIsSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Top navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBackToCustomer}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customer Portal</span>
        </button>

        <button
          onClick={onGoToDashboard}
          className="text-xs font-bold text-blue-600 hover:underline"
        >
          Go to Delivery Partner Dashboard →
        </button>
      </div>

      {isSubmitted ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-lg space-y-4">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black font-heading text-slate-900">
            Delivery Partner Registration Submitted!
          </h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Your identity details (Aadhaar: {formData.aadhaarNumber}, DL: {formData.drivingLicenseNumber}) and vehicle credentials are being verified by our operations team.
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={onGoToDashboard}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              Open Delivery Partner Dashboard
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-md">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-6 sm:p-8 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Bike className="w-5 h-5 text-blue-300" />
              <span className="text-xs font-black uppercase tracking-wider text-blue-200">
                JOIN LIKART DELIVERY FLEET
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-heading">
              Delivery Partner Onboarding Portal
            </h2>
            <p className="text-xs text-slate-200 mt-1 max-w-xl">
              Earn up to ₹35,000/month with flexible hours, insurance coverage, and instant daily UPI payouts.
            </p>

            {/* Stepper */}
            <div className="flex gap-2 mt-6">
              {[
                { s: 1, label: 'Personal & Vehicle' },
                { s: 2, label: 'KYC & License' },
                { s: 3, label: 'Payout UPI/Bank' },
              ].map((st) => (
                <div
                  key={st.s}
                  onClick={() => setStep(st.s)}
                  className={`flex-1 p-2 rounded-xl border text-center cursor-pointer transition ${
                    step === st.s
                      ? 'bg-white/20 border-white text-white font-bold'
                      : 'border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <span className="text-[10px] block uppercase">Step {st.s}</span>
                  <span className="text-xs font-semibold">{st.label}</span>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Step 1: Personal & Vehicle */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-heading font-black text-base text-slate-900 border-b border-slate-100 pb-2">
                  1. Personal Information & Vehicle Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Full Name (as per Aadhaar) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Suresh Varma"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Father's Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      placeholder="e.g. Narayana Varma"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Mobile Number (Linked with Aadhaar) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="10-digit mobile number"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Portal Login Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Create a driver portal password"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Vehicle Type *
                    </label>
                    <select
                      value={formData.vehicleType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vehicleType: e.target.value as any,
                        })
                      }
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-blue-500"
                    >
                      <option value="Motorcycle">Motorcycle (Petrol)</option>
                      <option value="Scooter">Scooter (Petrol)</option>
                      <option value="Electric Bike">Electric Bike (EV)</option>
                      <option value="Bicycle">Bicycle</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Vehicle Registration Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.vehicleNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })
                      }
                      placeholder="KA-05-MN-2024"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Preferred Delivery Zone *
                    </label>
                    <select
                      value={formData.zoneId}
                      onChange={(e) => setFormData({ ...formData, zoneId: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-blue-500 font-medium"
                    >
                      {zones.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
                  >
                    <span>Proceed to KYC Documents</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: KYC & Licenses */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-heading font-black text-base text-slate-900 border-b border-slate-100 pb-2">
                  2. Mandatory Government Documents (KYC)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Aadhaar Card Number (12-digits) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.aadhaarNumber}
                      onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                      placeholder="e.g. 8910 2345 6789"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      PAN Card Number (10-characters) *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={formData.panNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })
                      }
                      placeholder="e.g. BKUPV1234N"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Driving License (DL) Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.drivingLicenseNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, drivingLicenseNumber: e.target.value })
                      }
                      placeholder="e.g. KA-05-2017-0098124"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Vehicle RC Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.rcNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, rcNumber: e.target.value.toUpperCase() })
                      }
                      placeholder="e.g. KA-05-MN-2024"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-blue-500"
                    />
                  </div>
                </div>

                {/* Live Selfie & Document Verification Section */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Mandatory Rider Identity & KYC Documents
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-blue-200">
                      <CheckCircle className="w-3 h-3 text-blue-600" />
                      <span>
                        {[
                          formData.selfieUrl,
                          formData.aadhaarDocUrl,
                          formData.dlDocUrl,
                          formData.rcDocUrl,
                        ].filter(Boolean).length}{' '}
                        of 4 Ready
                      </span>
                    </span>
                  </div>

                  {/* 1. Live Selfie Capture Card */}
                  <div className="bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white rounded-2xl border border-blue-200 p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {formData.selfieUrl ? (
                            <img
                              src={formData.selfieUrl}
                              alt="Live Selfie"
                              className="w-16 h-16 rounded-full object-cover ring-4 ring-blue-500 shadow-md"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center ring-4 ring-blue-200">
                              <Camera className="w-8 h-8" />
                            </div>
                          )}
                          {formData.selfieUrl && (
                            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 shadow-xs">
                              <CheckCircle className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 font-heading">
                              1. Live Selfie Face Verification
                            </h4>
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                              Required
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 max-w-md">
                            Take a live webcam selfie or upload a clear front-facing portrait photo for fleet identity and security matching.
                          </p>
                          {formData.selfieUrl && (
                            <span className="text-[11px] text-emerald-700 font-bold inline-block mt-1">
                              ✓ Live Selfie Verified & Attached
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => setShowSelfieModal(true)}
                          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition flex items-center gap-1.5 active:scale-95"
                        >
                          <Camera className="w-4 h-4" />
                          <span>{formData.selfieUrl ? 'Retake / Change Selfie' : 'Take Live Selfie'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Documents Grid: Aadhaar, Driving License, Vehicle RC */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 2. Aadhaar Card */}
                    <DocumentUploadCard
                      id="rider-aadhaar"
                      title="Aadhaar Card Document"
                      description="Upload front & back copy of your Aadhaar Card (PDF/JPG)"
                      required={true}
                      fileUrl={formData.aadhaarDocUrl}
                      fileName={formData.aadhaarDocName}
                      iconType="aadhaar"
                      onChange={(url, name) =>
                        setFormData({
                          ...formData,
                          aadhaarDocUrl: url,
                          aadhaarDocName: name,
                        })
                      }
                      onRemove={() =>
                        setFormData({
                          ...formData,
                          aadhaarDocUrl: '',
                          aadhaarDocName: '',
                        })
                      }
                    />

                    {/* 3. Driving License */}
                    <DocumentUploadCard
                      id="rider-dl"
                      title="Driving License (DL)"
                      description="Upload valid 2-wheeler motor vehicle driving license (JPG/PDF)"
                      required={true}
                      fileUrl={formData.dlDocUrl}
                      fileName={formData.dlDocName}
                      iconType="dl"
                      onChange={(url, name) =>
                        setFormData({
                          ...formData,
                          dlDocUrl: url,
                          dlDocName: name,
                        })
                      }
                      onRemove={() =>
                        setFormData({
                          ...formData,
                          dlDocUrl: '',
                          dlDocName: '',
                        })
                      }
                    />

                    {/* 4. Vehicle RC */}
                    <DocumentUploadCard
                      id="rider-rc"
                      title="Vehicle RC Document"
                      description="Upload motor vehicle registration certificate book copy (PDF/JPG)"
                      required={true}
                      fileUrl={formData.rcDocUrl}
                      fileName={formData.rcDocName}
                      iconType="rc"
                      onChange={(url, name) =>
                        setFormData({
                          ...formData,
                          rcDocUrl: url,
                          rcDocName: name,
                        })
                      }
                      onRemove={() =>
                        setFormData({
                          ...formData,
                          rcDocUrl: '',
                          rcDocName: '',
                        })
                      }
                    />
                  </div>
                </div>

                {/* Live Selfie Modal instance */}
                <LiveSelfieCaptureModal
                  isOpen={showSelfieModal}
                  onClose={() => setShowSelfieModal(false)}
                  currentSelfieUrl={formData.selfieUrl}
                  onCapture={(selfieUrl) => {
                    setFormData({ ...formData, selfieUrl });
                  }}
                />

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
                  >
                    <span>Proceed to Payout Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payout Details & Submit */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-heading font-black text-base text-slate-900 border-b border-slate-100 pb-2">
                  3. Instant Payout UPI ID or Bank Account
                </h3>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    UPI ID for Daily Instant Settlement *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.payoutUpiOrBank}
                    onChange={(e) => setFormData({ ...formData, payoutUpiOrBank: e.target.value })}
                    placeholder="e.g. mobile@upi or username@okaxis"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-blue-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Earnings for completed trips are credited instantly to this UPI address.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-xs text-blue-900 leading-relaxed">
                  <p className="font-bold flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Delivery Partner Guarantee
                  </p>
                  <span>
                    Accidental insurance coverage up to ₹5,00,000, petrol allowance incentives, and transparent per-km payouts.
                  </span>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg transition"
                  >
                    Complete Registration
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};
