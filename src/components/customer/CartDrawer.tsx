import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Trash2,
  Zap,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    clearCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    cartTotals,
    setIsCheckoutOpen,
    coupons,
    restaurants,
    setCustomerView,
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isCartOpen) return null;

  const restaurantId = cart[0]?.item.restaurantId;
  const restaurant = restaurants.find((r) => r.id === restaurantId);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    const res = applyCoupon(couponInput);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponError('');
      setCouponInput('');
    }
  };

  const handleQuickApplyCoupon = (code: string) => {
    const res = applyCoupon(code);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponError('');
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-black text-lg text-slate-900">
                  Your Cart
                </h3>
                {restaurant ? (
                  <p className="text-xs text-slate-500 font-medium truncate max-w-[200px]">
                    from {restaurant.name}
                  </p>
                ) : restaurantId === 'likart-mart-hub-01' ? (
                  <p className="text-xs text-emerald-600 font-black flex items-center gap-1">
                    <span>⚡ Likart Mart • 10-Min Delivery</span>
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 transition"
                  title="Clear Cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart items list or Empty State */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-10 h-10 stroke-1" />
                </div>
                <h4 className="font-heading font-black text-lg text-slate-800">
                  Your cart is empty!
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Explore delicious gourmet meals from top restaurants and add your favorites.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCartOpen(false);
                      setCustomerView('home');
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow transition"
                  >
                    Browse Food Menu
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCartOpen(false);
                      setCustomerView('quick_commerce');
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    <span>Shop 10-Min Groceries</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Items */}
                <div className="space-y-3">
                  {cart.map(({ item, quantity, selectedVariant }) => {
                    const unitPrice = selectedVariant ? selectedVariant.price : item.price;
                    const itemKey = `${item.id}-${selectedVariant?.id || 'base'}`;

                    return (
                      <div
                        key={itemKey}
                        className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-3.5 h-3.5 border-2 rounded flex items-center justify-center p-0.5 shrink-0 ${
                              item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                            }`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                              }`}
                            />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {item.name}
                            </p>
                            {selectedVariant && (
                              <span className="inline-block text-[10px] font-bold text-orange-700 bg-orange-100 px-1.5 py-0.2 rounded mt-0.5">
                                {selectedVariant.name}
                              </span>
                            )}
                            <p className="text-[11px] font-semibold text-slate-500">
                              ₹{unitPrice} each
                            </p>
                          </div>
                        </div>

                        {/* Quantity Pill & Subtotal */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden text-xs font-bold shadow-2xs">
                            <button
                              onClick={() => updateCartQuantity(item.id, -1, selectedVariant?.id)}
                              className="p-1.5 hover:bg-slate-100 text-slate-600"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-slate-900">{quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.id, 1, selectedVariant?.id)}
                              className="p-1.5 hover:bg-slate-100 text-slate-600"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-xs font-black text-slate-900 min-w-[50px] text-right">
                            ₹{unitPrice * quantity}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Apply Coupon Box */}
                <div className="bg-orange-50/60 rounded-2xl p-3.5 border border-orange-200/70">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-black text-orange-950 uppercase tracking-wider">
                      Offers & Coupons
                    </span>
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-300 text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <div>
                          <p className="font-bold text-emerald-800">
                            '{appliedCoupon.code}' applied
                          </p>
                          <p className="text-[10px] text-emerald-600">
                            You saved ₹{cartTotals.discount}!
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-[11px] font-bold text-rose-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <form onSubmit={handleApply} className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="Enter Promo Code"
                          className="flex-1 text-xs px-3 py-2 bg-white border border-orange-200 rounded-xl uppercase font-bold focus:outline-orange-500"
                        />
                        <button
                          type="submit"
                          className="px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-xs"
                        >
                          Apply
                        </button>
                      </form>

                      {couponError && (
                        <p className="text-[11px] text-rose-600 font-semibold mt-1">
                          {couponError}
                        </p>
                      )}

                      {/* Quick Apply chips */}
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {coupons.slice(0, 3).map((cpn) => (
                          <button
                            key={cpn.id}
                            type="button"
                            onClick={() => handleQuickApplyCoupon(cpn.code)}
                            className="text-[10px] bg-white hover:bg-orange-100 border border-orange-200 text-orange-800 px-2 py-0.5 rounded-md font-extrabold transition"
                          >
                            {cpn.code}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bill Breakdown */}
                <div className="space-y-2 border-t border-slate-200 pt-4 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Item Total</span>
                    <span className="font-semibold text-slate-800">₹{cartTotals.itemTotal}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Delivery Fee</span>
                    <span className="font-semibold text-slate-800">
                      {cartTotals.deliveryFee === 0 ? (
                        <span className="text-emerald-600 font-bold">FREE</span>
                      ) : (
                        `₹${cartTotals.deliveryFee}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Platform Fee</span>
                    <span className="font-semibold text-slate-800">₹{cartTotals.platformFee}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>GST and Restaurant Taxes (5%)</span>
                    <span className="font-semibold text-slate-800">₹{cartTotals.taxes}</span>
                  </div>

                  {cartTotals.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Discount ({appliedCoupon?.code})</span>
                      <span>-₹{cartTotals.discount}</span>
                    </div>
                  )}

                  <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900">
                    <span>To Pay</span>
                    <span>₹{cartTotals.grandTotal}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Checkout CTA */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-white space-y-2">
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-600/25 flex items-center justify-between transition active:scale-98"
              >
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider text-orange-100 font-semibold">
                    Grand Total
                  </div>
                  <div className="text-base font-black">₹{cartTotals.grandTotal}</div>
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium pt-0.5">
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  💵 Cash on Delivery (COD)
                </span>
                <span>•</span>
                <span>UPI & Cards Accepted</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
