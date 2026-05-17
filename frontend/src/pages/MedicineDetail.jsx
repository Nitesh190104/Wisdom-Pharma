import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineShoppingCart, HiOutlineArrowLeft, HiOutlineMinus, HiOutlinePlus } from 'react-icons/hi';
import { medicineService } from '../services';
import { formatCurrency, formatDate } from '../utils/formatters';
import { LoadingSpinner } from '../components/ui';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

export default function MedicineDetail() {
  const { id } = useParams();
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addItem } = useCartStore();
  const { user } = useAuthStore();

  useEffect(() => {
    medicineService.getById(id).then(res => setMedicine(res.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const price = user?.role === 'store' ? medicine?.wholesale_price : medicine?.retail_price;
  const gst = price ? price * (medicine?.gst_percentage || 0) / 100 : 0;

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please login first'); return; }
    try {
      await addItem(medicine._id, qty);
      toast.success(`Added ${qty}x ${medicine.medicine_name} to cart!`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add'); }
  };

  if (loading) return <div className="py-20"><LoadingSpinner size="lg" text="Loading medicine details..." /></div>;
  if (!medicine) return <div className="py-20 text-center"><h2 className="text-xl font-semibold text-slate-700">Medicine not found</h2></div>;

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/medicines" className="inline-flex items-center gap-2 text-sm text-primary-600 font-medium hover:underline mb-6">
          <HiOutlineArrowLeft className="w-4 h-4" /> Back to Medicines
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Image */}
            <div className="h-80 lg:h-auto bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-12">
              {medicine.image ? (
                <img src={medicine.image} alt={medicine.medicine_name} className="max-h-64 object-contain" />
              ) : (
                <div className="text-9xl">💊</div>
              )}
            </div>

            {/* Details */}
            <div className="p-8 lg:p-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-0.5 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full">{medicine.category}</span>
                {medicine.prescription_required && (
                  <span className="px-2.5 py-0.5 bg-rose-50 text-rose-600 text-xs font-semibold rounded-full">Rx Required</span>
                )}
              </div>

              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">{medicine.medicine_name}</h1>
              <p className="text-sm text-slate-500 mb-6">by {medicine.manufacturer}</p>

              {/* Pricing */}
              <div className="bg-slate-50 rounded-xl p-5 mb-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl font-bold text-slate-800">{formatCurrency(price)}</span>
                  {user?.role === 'store' && (
                    <span className="text-sm text-slate-400 line-through">{formatCurrency(medicine.retail_price)}</span>
                  )}
                </div>
                <p className="text-sm text-slate-500">
                  +{formatCurrency(gst)} GST ({medicine.gst_percentage}%)
                  <span className="font-semibold text-slate-700 ml-2">Total: {formatCurrency(price + gst)}</span>
                </p>
                {user?.role === 'store' && (
                  <p className="text-xs text-emerald-600 mt-1 font-medium">
                    You save {formatCurrency(medicine.retail_price - medicine.wholesale_price)} per unit (wholesale price)
                  </p>
                )}
              </div>

              {/* Stock */}
              <div className="mb-6">
                {medicine.stock > 0 ? (
                  <span className="text-sm text-emerald-600 font-medium">✓ In Stock ({medicine.stock} units)</span>
                ) : (
                  <span className="text-sm text-rose-600 font-medium">✗ Out of Stock</span>
                )}
              </div>

              {/* Quantity & Add to Cart */}
              {medicine.stock > 0 && (
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 hover:bg-slate-50"><HiOutlineMinus className="w-4 h-4" /></button>
                    <span className="px-5 py-3 text-sm font-medium border-x border-slate-200 min-w-[3rem] text-center">{qty}</span>
                    <button onClick={() => setQty(Math.min(medicine.stock, qty + 1))} className="p-3 hover:bg-slate-50"><HiOutlinePlus className="w-4 h-4" /></button>
                  </div>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-sm">
                    <HiOutlineShoppingCart className="w-5 h-5" /> Add to Cart
                  </motion.button>
                </div>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200">
                {[
                  ['Composition', medicine.composition],
                  ['Dosage', medicine.dosage],
                  ['Expiry Date', formatDate(medicine.expiry_date)],
                  ['Min Wholesale Qty', medicine.min_wholesale_qty || 'N/A'],
                ].map(([label, val]) => val && (
                  <div key={label}>
                    <p className="text-xs text-slate-400 uppercase font-medium mb-1">{label}</p>
                    <p className="text-sm text-slate-700">{val}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              {medicine.description && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-800 mb-2">Description</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{medicine.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
