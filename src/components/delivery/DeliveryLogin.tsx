import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bike, Lock, Phone, ArrowRight, ArrowLeft, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface DeliveryLoginProps {
  onBackToCustomer: () => void;
  onGoToOnboarding: () => void;
}

export const DeliveryLogin: React.FC<DeliveryLoginProps> = ({
  onBackToCustomer,
  onGoToOnboarding,
}) => {
  const { loginRider } = useApp();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter your valid 10-digit registered mobile number.');
      return;
    }
    if (!password) {
      setError('Please enter your delivery fleet password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = loginRider(cleanPhone, password);
      setIsLoading(false);
      if (!res.success) {
        setError(res.message);
      }
    }, 400);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center max-w-md mx-auto px-4 py-12">
      <div className="mb-4">
        <button
          onClick={onBackToCustomer}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customer Website</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md shadow-blue-500/20">
            <Bike className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black font-heading text-slate-900 tracking-tight">
            Delivery Fleet Portal
          </h2>
          <p className="text-xs text-slate-500">
            Sign in with registered mobile number to start duty & receive delivery trips
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Registered Mobile Number
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-600 text-xs font-bold">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 10-digit mobile number"
                className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-r-xl focus:outline-blue-500 focus:bg-white font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Fleet Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter rider password"
                className="w-full text-xs pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-blue-500 focus:bg-white font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Verifying Mobile Record...</span>
            ) : (
              <>
                <span>Sign In to Rider Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Want to join the fleet?{' '}
            <button
              onClick={onGoToOnboarding}
              className="font-bold text-blue-600 hover:underline"
            >
              Apply as Delivery Partner (KYC)
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
