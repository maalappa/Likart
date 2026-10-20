import React, { useState, useEffect } from 'react';
import { X, Tag, CheckCircle } from 'lucide-react';
import { Coupon } from '../../../types';

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  mode: 'add' | 'edit';
  coupon?: Coupon | null;
}

export const CouponModal: React.FC<CouponModalProps> = ({
  isOpen,
  onClose,
  onSave,
  mode,
  coupon,
}) => {
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountPercent, setDiscountPercent] = useState(30);
  const [maxDiscount, setMaxDiscount] = useState(100);
  const [minOrderValue, setMinOrderValue] = useState(199);
  const [validUntil, setValidUntil] = useState('2026-12-31');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (coupon && mode === 'edit') {
      setCode(coupon.code);
      setDescription(coupon.description);
      setDiscountPercent(coupon.discountPercent);
      setMaxDiscount(coupon.maxDiscount);
      setMinOrderValue(coupon.minOrderValue);
      setValidUntil(coupon.validUntil || '2026-12-31');
      setIsActive(coupon.isActive);
    } else {
      setCode('');
      setDescription('');
      setDiscountPercent(20);
      setMaxDiscount(100);
      setMinOrderValue(149);
      setValidUntil('');
      setIsActive(true);
    }
  }, [coupon, mode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      code: code.trim().toUpperCase(),
      description,
      discountPercent: Number(discountPercent),
      maxDiscount: Number(maxDiscount),
      minOrderValue: Number(minOrderValue),
      validUntil,
      isActive,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-500/20 text-orange-400 rounded-xl">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-base">
                {mode === 'add' ? 'Super Admin: Create Coupon' : `Edit Coupon: ${coupon?.code}`}
              </h3>
              <p className="text-[11px] text-slate-400">
                Set promo code, percentage discount, maximum cap & minimum order
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
          <div>
            <label className="font-bold text-slate-700 block mb-1">Coupon Code *</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. MEGA50"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold uppercase focus:bg-white focus:outline-orange-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Description *</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 50% OFF up to ₹150 on your order"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Discount (%) *</label>
              <input
                type="number"
                min={1}
                max={100}
                required
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-orange-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Max Discount Cap (₹) *</label>
              <input
                type="number"
                min={10}
                required
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-orange-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Min Order Value (₹) *</label>
              <input
                type="number"
                min={0}
                required
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-orange-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Valid Until *</label>
              <input
                type="date"
                required
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-orange-500"
              />
            </div>
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded"
              />
              <span>Coupon Active & Claimable</span>
            </label>
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
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-md shadow-orange-600/20 transition flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{mode === 'add' ? 'Publish Coupon' : 'Update Coupon'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
