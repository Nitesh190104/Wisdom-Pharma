import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiOutlineShoppingCart } from 'react-icons/hi';
import { formatCurrency } from '../utils/formatters';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

export default function MedicineCard({ medicine }) {
  const { addItem } = useCartStore();
  const { user } = useAuthStore();
  const medicineId = medicine._id || medicine.id;

  const price = user?.role === 'store' ? medicine.wholesale_price : medicine.retail_price;
  const gst = price * (medicine.gst_percentage || 0) / 100;
  const isOutOfStock = medicine.stock <= 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Please login to add items to cart'); return; }
    try {
      await addItem(medicineId, 1);
      toast.success(`${medicine.medicine_name} added to cart!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all duration-300">
      <Link to={`/medicines/${medicineId}`}>
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center overflow-hidden">
          {medicine.image ? (
            <img src={medicine.image} alt={medicine.medicine_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="text-6xl">💊</div>
          )}
          {medicine.prescription_required && (
            <span className="absolute top-3 left-3 px-2 py-1 bg-rose-500 text-white text-[10px] font-bold rounded-lg uppercase">Rx Required</span>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="px-3 py-1.5 bg-white text-slate-800 text-sm font-semibold rounded-lg">Out of Stock</span>
            </div>
          )}
          {medicine.stock > 0 && medicine.stock <= 10 && (
            <span className="absolute top-3 right-3 px-2 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-lg">Low Stock</span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-xs text-primary-600 font-medium mb-1">{medicine.category || 'General'}</p>
          <h3 className="font-semibold text-slate-800 mb-1 line-clamp-1">{medicine.medicine_name}</h3>
          <p className="text-xs text-slate-500 mb-3">{medicine.manufacturer}</p>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-slate-800">{formatCurrency(price)}</p>
              <p className="text-[10px] text-slate-400">+{formatCurrency(gst)} GST ({medicine.gst_percentage}%)</p>
            </div>
            {!isOutOfStock && user?.role !== 'admin' && (
              <button onClick={handleAddToCart}
                className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md">
                <HiOutlineShoppingCart className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
