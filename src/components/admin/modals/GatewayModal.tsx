import React, { useState, useEffect } from 'react';
import { X, CreditCard, CheckCircle, ShieldCheck } from 'lucide-react';
import { PaymentGatewayItem } from '../../../types';

interface GatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  mode: 'add' | 'edit';
  gateway?: PaymentGatewayItem | null;
}

export const GatewayModal: React.FC<GatewayModalProps> = ({
  isOpen,
  onClose,
  onSave,
  mode,
  gateway,
}) => {
  const [provider, setProvider] = useState('razorpay');
  const [name, setName] = useState('');
  const [appOrMerchantId, setAppOrMerchantId] = useState('');
  const [apiKeyOrSecret, setApiKeyOrSecret] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [testMode, setTestMode] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [methodsStr, setMethodsStr] = useState('Razorpay Direct Session, Real-Time Settlement, Automated Refund SLA');

  const isCod = provider === 'cod';

  useEffect(() => {
    if (gateway && mode === 'edit') {
      setProvider(gateway.provider);
      setName(gateway.name);
      setAppOrMerchantId(gateway.appOrMerchantId);
      setApiKeyOrSecret(gateway.apiKeyOrSecretMasked);
      setWebhookSecret(gateway.webhookSecret || '');
      setTestMode(gateway.testMode);
      setEnabled(gateway.enabled);
      setMethodsStr(gateway.supportedMethods.join(', '));
    } else {
      setProvider('razorpay');
      setName('');
      setAppOrMerchantId('');
      setApiKeyOrSecret('');
      setWebhookSecret('');
      setTestMode(false);
      setEnabled(true);
      setMethodsStr('Razorpay Direct Session, Real-Time Settlement, Automated Refund SLA');
    }
  }, [gateway, mode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const methods = methodsStr.split(',').map((m) => m.trim()).filter(Boolean);
    const effectiveAppId = isCod ? (appOrMerchantId.trim() || 'COD-DOORSTEP') : appOrMerchantId.trim();
    const effectiveSecret = isCod ? (apiKeyOrSecret.trim() || 'DOORSTEP_CASH') : apiKeyOrSecret.trim();

    const payload = {
      provider,
      name,
      appOrMerchantId: effectiveAppId,
      apiKeyOrSecretMasked: isCod
        ? '••••••••••••COD'
        : effectiveSecret.startsWith('••••')
        ? effectiveSecret
        : `••••••••••••${effectiveSecret.slice(-4) || 'ABCD'}`,
      webhookSecret,
      testMode: isCod ? false : testMode,
      enabled,
      supportedMethods:
        methods.length > 0
          ? methods
          : isCod
          ? ['Cash Payment on Delivery', 'Doorstep UPI QR Code Scan', 'Zero Advance Payment']
          : ['UPI', 'Cards'],
    };
    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-base">
                {mode === 'add' ? 'Super Admin: Configure Payment Gateway' : `Edit Gateway: ${gateway?.name}`}
              </h3>
              <p className="text-[11px] text-slate-400">
                Securely store Merchant IDs, encrypted API Secrets, and webhook endpoints
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Provider Engine *</label>
              <select
                value={provider}
                onChange={(e) => {
                  const val = e.target.value;
                  setProvider(val);
                  if (mode === 'add') {
                    if (val === 'razorpay') setName('Razorpay Payment Gateway');
                    else if (val === 'cashfree') setName('Cashfree Payments AutoCollect');
                    else if (val === 'phonepe') setName('PhonePe PG Express');
                    else if (val === 'stripe') setName('Stripe International Gateway');
                    else if (val === 'payu') setName('PayU Payments Hub');
                    else if (val === 'cod') setName('Cash on Delivery (COD)');
                  }
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-blue-500"
              >
                <option value="razorpay">Razorpay</option>
                <option value="cashfree">Cashfree Payments</option>
                <option value="phonepe">PhonePe</option>
                <option value="stripe">Stripe</option>
                <option value="payu">PayU</option>
                <option value="cod">Cash on Delivery</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Display Label *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Razorpay PG"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">
                {isCod ? 'COD Doorstep Reference Code' : 'Merchant / Client / App ID *'}
              </label>
              <input
                type="text"
                required={!isCod}
                value={appOrMerchantId}
                onChange={(e) => setAppOrMerchantId(e.target.value)}
                placeholder={isCod ? 'e.g. COD-DOORSTEP' : 'e.g. rzp_live_91823719'}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-blue-500"
              />
              {isCod && (
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Reference identifier used for doorstep cash and dynamic UPI QR collections.
                </span>
              )}
            </div>

            {!isCod ? (
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">API Key / Secret Key *</label>
                <input
                  type="password"
                  required
                  value={apiKeyOrSecret}
                  onChange={(e) => setApiKeyOrSecret(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-blue-500"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Sensitive keys are masked and encrypted before database storage.
                </span>
              </div>
            ) : (
              <div className="sm:col-span-2 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <span>💵 Cash on Delivery Security Policy</span>
                </p>
                <p className="text-[11px] text-amber-800">
                  No online gateway API secret required. Customers can pay with cash or scan the delivery partner's verified dynamic UPI QR code upon doorstep handover.
                </p>
              </div>
            )}

            {!isCod && (
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Webhook Secret (Optional)</label>
                <input
                  type="text"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  placeholder="whsec_..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-blue-500"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Supported Payment Methods (comma-separated)</label>
              <input
                type="text"
                value={methodsStr}
                onChange={(e) => setMethodsStr(e.target.value)}
                placeholder="Official PG, Instant Settlement, Verified Security"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span>Active / Enabled</span>
              </label>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={testMode}
                  onChange={(e) => setTestMode(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <span>Sandbox / Test Mode</span>
              </label>
            </div>
          </div>

          {/* Permanent Save Access Notice */}
          <div className="p-3 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">
                Permanent Save Access: Gateway credentials & active status recorded in permanent master storage.
              </span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full shrink-0 border border-emerald-200">
              Encrypted
            </span>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/20 transition flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{mode === 'add' ? 'Save Gateway' : 'Update Credentials'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
