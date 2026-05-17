import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import { orderService } from '../services';
import { formatCurrency } from '../utils/formatters';
import { PAYMENT_METHODS } from '../utils/constants';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { cart, fetchCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { shipping_address: { name: user?.name, phone: user?.phone, address: user?.address || '', city: user?.city || '', state: user?.state || '', pincode: user?.pincode || '' }, payment_method: 'cod' },
  });

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const onSubmit = async (data) => {
    try {
      await orderService.place(data);
      toast.success('Order placed successfully!');
      navigate(`/orders`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to place order'); }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400";

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Checkout</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Shipping Address</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                      <input {...register('shipping_address.name', { required: 'Required' })} className={inputClass} />
                      {errors.shipping_address?.name && <p className="text-xs text-rose-500 mt-1">{errors.shipping_address.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                      <input {...register('shipping_address.phone', { required: 'Required' })} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                    <input {...register('shipping_address.address', { required: 'Required' })} className={inputClass} placeholder="Street address" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                      <input {...register('shipping_address.city', { required: 'Required' })} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                      <input {...register('shipping_address.state', { required: 'Required' })} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Pincode</label>
                      <input {...register('shipping_address.pincode', { required: 'Required' })} className={inputClass} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Payment Method</h3>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map(({ value, label }) => (
                    <label key={value} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-primary-200 cursor-pointer transition-colors">
                      <input {...register('payment_method')} type="radio" value={value} className="text-primary-600 focus:ring-primary-500" />
                      <span className="text-sm font-medium text-slate-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">Order Notes (optional)</label>
                <textarea {...register('notes')} rows={3} className={inputClass + ' resize-none'} placeholder="Any special instructions..." />
              </div>
            </div>

            {/* Summary */}
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
              <button type="submit" disabled={isSubmitting || !cart.items?.length}
                className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60 shadow-sm">
                {isSubmitting ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
