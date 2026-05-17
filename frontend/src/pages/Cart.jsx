import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineTrash, HiOutlineMinus, HiOutlinePlus, HiOutlineShoppingBag } from 'react-icons/hi';
import useCartStore from '../store/useCartStore';
import { formatCurrency } from '../utils/formatters';
import { LoadingSpinner, EmptyState } from '../components/ui';
import toast from 'react-hot-toast';

export default function Cart() {
  const { cart, fetchCart, updateItem, removeItem, loading } = useCartStore();

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const handleQuantityChange = async (medicineId, newQty) => {
    if (newQty < 1) return;
    try { await updateItem(medicineId, newQty); } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
  };

  if (loading) return <div className="py-20"><LoadingSpinner size="lg" text="Loading cart..." /></div>;

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Shopping Cart</h1>

        {(!cart.items || cart.items.length === 0) ? (
          <EmptyState icon={HiOutlineShoppingBag} title="Your cart is empty" description="Browse medicines and add items to your cart"
            action={<Link to="/medicines" className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors">Browse Medicines</Link>} />
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <motion.div key={item.medicine_id} layout className="bg-white rounded-2xl border border-slate-200 p-5 flex gap-5">
                  <div className="w-20 h-20 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover rounded-xl" /> : <span className="text-3xl">💊</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate">{item.medicine_name}</h3>
                    <p className="text-sm text-slate-500">{formatCurrency(item.unit_price)} × {item.quantity}</p>
                    <p className="text-xs text-slate-400 mt-0.5">GST: {formatCurrency(item.gst_amount)} ({item.gst_percentage}%)</p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                        <button onClick={() => handleQuantityChange(item.medicine_id, item.quantity - 1)} className="p-1.5 hover:bg-slate-50"><HiOutlineMinus className="w-3.5 h-3.5" /></button>
                        <span className="px-3 text-sm font-medium border-x border-slate-200">{item.quantity}</span>
                        <button onClick={() => handleQuantityChange(item.medicine_id, item.quantity + 1)} className="p-1.5 hover:bg-slate-50"><HiOutlinePlus className="w-3.5 h-3.5" /></button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-slate-800">{formatCurrency(item.total)}</span>
                        <button onClick={() => { removeItem(item.medicine_id); toast.success('Item removed'); }}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><HiOutlineTrash className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 h-fit sticky top-20">
              <h3 className="font-semibold text-slate-800 mb-4">Order Summary</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span className="text-slate-700">{formatCurrency(cart.subtotal)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">GST</span><span className="text-slate-700">{formatCurrency(cart.gst_total)}</span></div>
                <hr className="border-slate-200" />
                <div className="flex justify-between"><span className="font-semibold text-slate-800">Total</span><span className="text-xl font-bold text-slate-800">{formatCurrency(cart.total)}</span></div>
              </div>
              <Link to="/checkout" className="block w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors text-center shadow-sm">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
