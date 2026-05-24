import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineShoppingCart, HiOutlineArrowLeft, HiOutlineMinus, HiOutlinePlus, HiOutlinePencilAlt, HiOutlineX } from 'react-icons/hi';
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

  // Admin edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    medicine_name: '',
    manufacturer: '',
    retail_price: '',
    wholesale_price: '',
    gst_percentage: '',
    stock: '',
    composition: '',
    dosage: '',
    expiry_date: '',
    min_wholesale_qty: '',
    description: '',
    category: '',
    prescription_required: false,
  });

  useEffect(() => {
    medicineService.getById(id).then(res => setMedicine(res.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!medicine) return;
    if (user?.role === 'store') {
      const minQty = Math.max(1, Number(medicine.min_wholesale_qty || 1));
      setQty((prev) => (prev < minQty ? minQty : prev));
    }
  }, [medicine, user?.role]);

  const price = user?.role === 'store' ? medicine?.wholesale_price : medicine?.retail_price;
  const gst = price ? price * (medicine?.gst_percentage || 0) / 100 : 0;

  const minQty = user?.role === 'store' ? Math.max(1, Number(medicine?.min_wholesale_qty || 1)) : 1;

  const isStorePending = user?.role === 'store' && user?.business?.is_verified !== true;

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please login first'); return; }
    if (isStorePending) {
      toast.error('Your business account is pending verification. Please wait for admin approval.');
      return;
    }
    try {
      await addItem(medicine._id || medicine.id, qty);
      toast.success(`Added ${qty}x ${medicine.medicine_name} to cart!`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add'); }
  };

  const handleOpenEdit = () => {
    setEditForm({
      medicine_name: medicine.medicine_name || '',
      manufacturer: medicine.manufacturer || '',
      retail_price: medicine.retail_price || '',
      wholesale_price: medicine.wholesale_price || '',
      gst_percentage: medicine.gst_percentage || '',
      stock: medicine.stock || '',
      composition: medicine.composition || '',
      dosage: medicine.dosage || '',
      expiry_date: medicine.expiry_date ? medicine.expiry_date.split('T')[0] : '',
      min_wholesale_qty: medicine.min_wholesale_qty || '',
      description: medicine.description || '',
      category: medicine.category || '',
      prescription_required: medicine.prescription_required || false,
    });
    setIsEditing(true);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editForm,
        retail_price: Number(editForm.retail_price),
        wholesale_price: Number(editForm.wholesale_price),
        gst_percentage: Number(editForm.gst_percentage),
        stock: Number(editForm.stock),
        min_wholesale_qty: editForm.min_wholesale_qty ? Number(editForm.min_wholesale_qty) : null,
      };
      
      const res = await medicineService.update(medicine._id || medicine.id, payload);
      toast.success('Medicine details updated successfully!');
      setMedicine(res.data.data);
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update medicine details');
    }
  };

  if (loading) return <div className="py-20"><LoadingSpinner size="lg" text="Loading medicine details..." /></div>;
  if (!medicine) return <div className="py-20 text-center"><h2 className="text-xl font-semibold text-slate-700">Medicine not found</h2></div>;

  const modalInputClass = "w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all";

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/medicines" className="inline-flex items-center gap-2 text-sm text-primary-600 font-medium hover:underline mb-6">
          <HiOutlineArrowLeft className="w-4 h-4" /> Back to Medicines
        </Link>
 
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Image */}
            <div className="h-80 lg:h-auto bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-12 relative">
              {medicine.image ? (
                <img src={medicine.image} alt={medicine.medicine_name} className="max-h-64 object-contain" />
              ) : (
                <div className="text-9xl">💊</div>
              )}
              {user?.role === 'admin' && (
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full">Admin Mode</span>
                </div>
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
                  <span className="text-3xl font-bold text-slate-800">{formatCurrency(price || medicine.retail_price)}</span>
                  {user?.role === 'store' && (
                    <span className="text-sm text-slate-400 line-through">{formatCurrency(medicine.retail_price)}</span>
                  )}
                </div>
                <p className="text-sm text-slate-500">
                  +{formatCurrency(gst || (medicine.retail_price * (medicine.gst_percentage || 0) / 100))} GST ({medicine.gst_percentage}%)
                  <span className="font-semibold text-slate-700 ml-2">Total: {formatCurrency((price || medicine.retail_price) + (gst || (medicine.retail_price * (medicine.gst_percentage || 0) / 100)))}</span>
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
              {medicine.stock > 0 && user?.role !== 'admin' && (
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                    <button onClick={() => setQty(Math.max(minQty, qty - 1))} className="p-3 hover:bg-slate-50"><HiOutlineMinus className="w-4 h-4" /></button>
                    <span className="px-5 py-3 text-sm font-medium border-x border-slate-200 min-w-[3rem] text-center">{qty}</span>
                    <button onClick={() => setQty(Math.min(medicine.stock, qty + 1))} className="p-3 hover:bg-slate-50"><HiOutlinePlus className="w-4 h-4" /></button>
                  </div>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleAddToCart}
                    disabled={isStorePending}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
                    <HiOutlineShoppingCart className="w-5 h-5" /> Add to Cart
                  </motion.button>
                </div>
              )}

              {/* Admin Actions */}
              {user?.role === 'admin' && (
                <div className="mb-6">
                  <motion.button 
                    whileTap={{ scale: 0.97 }} 
                    onClick={handleOpenEdit}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    <HiOutlinePencilAlt className="w-5 h-5" /> Change Medicine Details
                  </motion.button>
                </div>
              )}
 
              {isStorePending && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
                  <p className="text-sm text-amber-800 font-medium">Your business account is pending verification. Wholesale ordering unlocks after admin approval.</p>
                </div>
              )}
 
              {user?.role === 'store' && (medicine.min_wholesale_qty || 0) > 1 && (
                <p className="text-xs text-slate-500 -mt-3 mb-6">Minimum wholesale order: <span className="font-semibold text-slate-700">{medicine.min_wholesale_qty}</span> units</p>
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

      {/* Admin Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <HiOutlinePencilAlt className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-bold text-slate-800">Edit Medicine Details</h3>
                </div>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form Content */}
              <form onSubmit={handleSaveChanges} className="flex-1 overflow-y-auto p-6 space-y-4">
                
                {/* 1. Name & Manufacturer */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Medicine Name</label>
                    <input 
                      type="text" 
                      value={editForm.medicine_name} 
                      onChange={(e) => setEditForm({ ...editForm, medicine_name: e.target.value })}
                      className={modalInputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Manufacturer</label>
                    <input 
                      type="text" 
                      value={editForm.manufacturer} 
                      onChange={(e) => setEditForm({ ...editForm, manufacturer: e.target.value })}
                      className={modalInputClass}
                      required
                    />
                  </div>
                </div>

                {/* 2. Category & Rx Required */}
                <div className="grid grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className={modalInputClass}
                      required
                    >
                      <option value="Critical Care Injections">Critical Care Injections</option>
                      <option value="Specialty Oral Tablets">Specialty Oral Tablets</option>
                      <option value="General OTC & Pain Relief">General OTC & Pain Relief</option>
                      <option value="Medical & Surgical Supplies">Medical & Surgical Supplies</option>
                      <option value="Surgical Instruments">Surgical Instruments</option>
                    </select>
                  </div>
                  <div className="flex items-center h-full pt-5">
                    <label className="relative flex items-center cursor-pointer gap-3">
                      <input 
                        type="checkbox" 
                        checked={editForm.prescription_required} 
                        onChange={(e) => setEditForm({ ...editForm, prescription_required: e.target.checked })}
                        className="w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500/20"
                      />
                      <span className="text-sm font-semibold text-slate-700">Prescription Required (Rx)</span>
                    </label>
                  </div>
                </div>

                {/* 3. Pricing & Taxes */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Retail Price (₹)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={editForm.retail_price} 
                      onChange={(e) => setEditForm({ ...editForm, retail_price: e.target.value })}
                      className={modalInputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Wholesale Price (₹)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={editForm.wholesale_price} 
                      onChange={(e) => setEditForm({ ...editForm, wholesale_price: e.target.value })}
                      className={modalInputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">GST Tax (%)</label>
                    <input 
                      type="number" 
                      value={editForm.gst_percentage} 
                      onChange={(e) => setEditForm({ ...editForm, gst_percentage: e.target.value })}
                      className={modalInputClass}
                      required
                    />
                  </div>
                </div>

                {/* 4. Stock & Min Wholesale */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Current Stock</label>
                    <input 
                      type="number" 
                      value={editForm.stock} 
                      onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                      className={modalInputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Min Wholesale Qty</label>
                    <input 
                      type="number" 
                      value={editForm.min_wholesale_qty} 
                      onChange={(e) => setEditForm({ ...editForm, min_wholesale_qty: e.target.value })}
                      className={modalInputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expiry Date</label>
                    <input 
                      type="date" 
                      value={editForm.expiry_date} 
                      onChange={(e) => setEditForm({ ...editForm, expiry_date: e.target.value })}
                      className={modalInputClass}
                      required
                    />
                  </div>
                </div>

                {/* 5. Composition & Dosage */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Composition</label>
                    <input 
                      type="text" 
                      value={editForm.composition} 
                      onChange={(e) => setEditForm({ ...editForm, composition: e.target.value })}
                      className={modalInputClass}
                      placeholder="e.g. Paracetamol 500mg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dosage Instruction</label>
                    <input 
                      type="text" 
                      value={editForm.dosage} 
                      onChange={(e) => setEditForm({ ...editForm, dosage: e.target.value })}
                      className={modalInputClass}
                      placeholder="e.g. 1 tablet twice a day"
                      required
                    />
                  </div>
                </div>

                {/* 6. Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Medicine Description</label>
                  <textarea 
                    rows={4}
                    value={editForm.description} 
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className={`${modalInputClass} resize-none`}
                    placeholder="Enter thorough therapeutic detail, uses, warnings..."
                    required
                  />
                </div>

                {/* Modal Footer Controls */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-white sticky bottom-0">
                  <button 
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-md"
                  >
                    Save Changes
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

