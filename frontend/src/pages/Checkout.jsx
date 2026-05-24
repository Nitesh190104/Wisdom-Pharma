import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import { orderService } from '../services';
import { formatCurrency } from '../utils/formatters';
import { HiOutlineTrash, HiOutlineMinus, HiOutlinePlus } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { PAYMENT_METHODS } from '../utils/constants';
import toast from 'react-hot-toast';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

// Dynamically load Razorpay checkout script
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const { cart, fetchCart, updateItem, removeItem } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      shipping_address: {
        name: user?.name, phone: user?.phone,
        address: user?.address || '', city: user?.city || '',
        state: user?.state || '', pincode: user?.pincode || '',
      },
      payment_method: 'cod',
    },
  });

  const paymentMethod = useWatch({ control, name: 'payment_method' });

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const handleQuantityChange = async (medicineId, newQty) => {
    if (newQty < 1) return;
    try { await updateItem(medicineId, newQty); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
  };

  const getMinQty = (item) => {
    if (user?.role !== 'store') return 1;
    return Math.max(1, Number(item?.min_wholesale_qty || 1));
  };

  const isStorePending = user?.role === 'store' && user?.business?.is_verified !== true;

  // Place order after payment (used for both COD and UPI success)
  const placeOrder = useCallback(async (formData, razorpayPaymentId = null) => {
    const payload = { ...formData };
    if (razorpayPaymentId) {
      payload.razorpay_payment_id = razorpayPaymentId;
      payload.payment_status = 'paid';
    }
    await orderService.place(payload);
    // Backend clears the cart, but we must refresh client state
    await fetchCart();
    toast.success('Order placed successfully!');
    navigate('/orders');
  }, [fetchCart, navigate]);

  const onSubmit = async (data) => {
    if (isStorePending) {
      toast.error('Your business account is pending verification. Please wait for admin approval.');
      return;
    }

    // COD — place directly
    if (data.payment_method === 'cod') {
      try { await placeOrder(data); }
      catch (err) { toast.error(err.response?.data?.message || 'Failed to place order'); }
      return;
    }

    // UPI — open Razorpay checkout
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error('Failed to load payment gateway. Please check your internet connection.');
      return;
    }

    const amountInPaise = Math.ceil(cart.total || 0) * 100;

    const options = {
      key: RAZORPAY_KEY,
      amount: amountInPaise,
      currency: 'INR',
      name: 'Wisdom Pharma',
      description: 'Medicine Order Payment',
      image: '/favicon.ico',
      prefill: {
        name:  data.shipping_address.name  || user?.name  || '',
        email: user?.email || '',
        contact: data.shipping_address.phone || user?.phone || '',
      },
      method: { upi: true, card: false, netbanking: false, wallet: false },
      theme: { color: '#6366f1' },
      handler: async (response) => {
        // Payment succeeded — place the order with the Razorpay payment ID
        try {
          await placeOrder(data, response.razorpay_payment_id);
        } catch (err) {
          toast.error(err.response?.data?.message || 'Order placement failed after payment. Contact support.');
        }
      },
      modal: {
        ondismiss: () => toast('Payment cancelled. Your order was not placed.', { icon: 'ℹ️' }),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
      toast.error(`Payment failed: ${response.error.description}`);
    });
    rzp.open();
  };

  const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400';

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Checkout</h1>

        {isStorePending && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
            <p className="text-amber-800 font-medium">Your business account is pending verification. You can place wholesale orders once approved by admin.</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">

              {/* Cart Items */}
              {cart.items?.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h3 className="font-semibold text-slate-800 mb-4">Cart Items</h3>
                  <div className="space-y-4">
                    {cart.items.map((item) => (
                      <motion.div key={item.medicine_id} layout className="flex gap-5 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                        <div className="w-16 h-16 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          {item.image
                            ? <img src={item.image} alt="" className="w-full h-full object-cover rounded-xl" />
                            : <span className="text-2xl">💊</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-800 truncate text-sm">{item.medicine_name}</h4>
                          <p className="text-xs text-slate-500 mt-1">{formatCurrency(item.unit_price)} each</p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                              <button type="button" onClick={() => handleQuantityChange(item.medicine_id, Math.max(getMinQty(item), item.quantity - 1))} className="p-1 hover:bg-slate-50"><HiOutlineMinus className="w-3.5 h-3.5" /></button>
                              <span className="px-3 text-xs font-medium border-x border-slate-200">{item.quantity}</span>
                              <button type="button" onClick={() => handleQuantityChange(item.medicine_id, Math.min(item.stock ?? Infinity, item.quantity + 1))} className="p-1 hover:bg-slate-50"><HiOutlinePlus className="w-3.5 h-3.5" /></button>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-sm text-slate-800">{formatCurrency(item.total)}</span>
                              <button type="button" onClick={() => { removeItem(item.medicine_id); toast.success('Item removed'); }}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><HiOutlineTrash className="w-4 h-4" /></button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shipping Address */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Shipping Address</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="shipping_name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                      <input id="shipping_name" {...register('shipping_address.name', { required: 'Required' })} className={inputClass} />
                      {errors.shipping_address?.name && <p className="text-xs text-rose-500 mt-1">{errors.shipping_address.name.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="shipping_phone" className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                      <input id="shipping_phone" {...register('shipping_address.phone', { required: 'Required' })} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="shipping_addr" className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                    <input id="shipping_addr" {...register('shipping_address.address', { required: 'Required' })} className={inputClass} placeholder="Street address" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="shipping_city" className="block text-sm font-medium text-slate-700 mb-1">City</label>
                      <input id="shipping_city" {...register('shipping_address.city', { required: 'Required' })} className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="shipping_state" className="block text-sm font-medium text-slate-700 mb-1">State</label>
                      <input id="shipping_state" {...register('shipping_address.state', { required: 'Required' })} className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="shipping_pincode" className="block text-sm font-medium text-slate-700 mb-1">Pincode</label>
                      <input id="shipping_pincode" {...register('shipping_address.pincode', { required: 'Required' })} className={inputClass} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Payment Method</h3>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map(({ value, label }) => (
                    <label key={value}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === value ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-primary-200'}`}>
                      <input {...register('payment_method')} type="radio" value={value} className="text-primary-600 focus:ring-primary-500 w-4 h-4" />
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-xl">{value === 'cod' ? '💵' : '📱'}</span>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{label}</p>
                          <p className="text-xs text-slate-500">
                            {value === 'cod'
                              ? 'Pay cash when your order arrives'
                              : 'Pay instantly via UPI (Google Pay, PhonePe, Paytm, etc.)'}
                          </p>
                        </div>
                        {value === 'upi' && (
                          <div className="ml-auto flex items-center gap-1.5">
                            {['G Pay', 'PhonePe', 'Paytm'].map(app => (
                              <span key={app} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{app}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
                {paymentMethod === 'upi' && (
                  <div className="mt-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                    <p className="text-xs text-indigo-700 font-medium">🔒 Secure payment powered by Razorpay. You'll be redirected to complete UPI payment.</p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <label htmlFor="order_notes" className="block text-sm font-medium text-slate-700 mb-1">Order Notes (optional)</label>
                <textarea id="order_notes" {...register('notes')} rows={3} className={inputClass + ' resize-none'} placeholder="Any special instructions..." />
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 h-fit sticky top-20">
              <h3 className="font-semibold text-slate-800 mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {cart.items?.map(item => (
                  <div key={item.medicine_id} className="flex justify-between text-sm">
                    <span className="text-slate-600 truncate max-w-[180px]">{item.medicine_name} ×{item.quantity}</span>
                    <span className="text-slate-700 font-medium">{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>
              <hr className="border-slate-200 my-4" />
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span>{formatCurrency(cart.subtotal)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">GST</span><span>{formatCurrency(cart.gst_total)}</span></div>
                <hr className="border-slate-200" />
                <div className="flex justify-between"><span className="font-semibold">Total</span><span className="text-xl font-bold text-slate-800">{formatCurrency(cart.total)}</span></div>
              </div>

              <button type="submit" disabled={isSubmitting || !cart.items?.length || isStorePending}
                className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60 shadow-sm flex items-center justify-center gap-2">
                {isSubmitting ? 'Processing...' : (
                  <>
                    {paymentMethod === 'upi' ? '📱 Pay via UPI' : '💵 Place Order (COD)'}
                  </>
                )}
              </button>
              <p className="text-xs text-slate-400 text-center mt-3">
                {paymentMethod === 'upi' ? 'You\'ll be redirected to Razorpay to complete payment' : 'Pay cash upon delivery'}
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
