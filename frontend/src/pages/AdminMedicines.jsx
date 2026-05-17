import { useState, useEffect } from 'react';
import { medicineService, categoryService } from '../services';
import { formatCurrency } from '../utils/formatters';
import { SearchBar, Badge, LoadingSpinner, Pagination } from '../components/ui';
import { useDebounce } from '../hooks';
import toast from 'react-hot-toast';

const getId = (item) => item?._id || item?.id;

export default function AdminMedicines() {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    categoryService.getAll().then(res => setCategories(res.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, per_page: 15 };
    if (debouncedSearch) params.search = debouncedSearch;
    medicineService.getAll(params).then(res => {
      setMedicines(res.data.data?.data || []);
      setTotalPages(res.data.data?.last_page || 1);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [page, debouncedSearch, refreshVersion]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this medicine?')) return;
    try {
      await medicineService.delete(id);
      setMedicines(prev => prev.filter(m => getId(m) !== id));
      setRefreshVersion(prev => prev + 1);
      toast.success('Medicine deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditingMed(null);
    setPage(1);
    setRefreshVersion(prev => prev + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Medicines Management</h1>
        <button onClick={() => { setEditingMed(null); setShowForm(!showForm); }}
          className="px-4 py-2 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 text-sm transition-colors">
          {showForm ? 'Close Form' : '+ Add Medicine'}
        </button>
      </div>

      {showForm && <MedicineForm key={getId(editingMed) || 'new'} categories={categories} medicine={editingMed} onSaved={handleSaved} />}

      <div className="mb-4 max-w-sm"><SearchBar value={search} onChange={setSearch} placeholder="Search medicines..." /></div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-500">Medicine</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Category</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Stock</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Retail</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Wholesale</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Rx</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Actions</th>
              </tr></thead>
              <tbody>
                {medicines.map(med => (
                  <tr key={getId(med)} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{med.medicine_name}</p>
                      <p className="text-xs text-slate-400">{med.manufacturer}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{med.category}</td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${med.stock <= 0 ? 'text-rose-600' : med.stock <= 10 ? 'text-amber-600' : 'text-emerald-600'}`}>{med.stock}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{formatCurrency(med.retail_price)}</td>
                    <td className="py-3 px-4 text-slate-700">{formatCurrency(med.wholesale_price)}</td>
                    <td className="py-3 px-4">{med.prescription_required ? <Badge status="active" /> : '—'}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingMed(med); setShowForm(true); }} className="text-xs text-primary-600 font-medium hover:underline">Edit</button>
                        <button onClick={() => handleDelete(getId(med))} className="text-xs text-rose-600 font-medium hover:underline">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4"><Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} /></div>
        </div>
      )}
    </div>
  );
}

function MedicineForm({ categories, medicine, onSaved }) {
  const [form, setForm] = useState(medicine || {
    medicine_name: '', description: '', category_id: '', category: '', stock: 0,
    retail_price: 0, wholesale_price: 0, gst_percentage: 12, expiry_date: '', manufacturer: '',
    prescription_required: false, dosage: '', composition: '', min_wholesale_qty: 50,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    const cat = categories.find(c => getId(c) === catId);
    setForm(prev => ({ ...prev, category_id: catId, category: cat?.name || '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (getId(medicine)) await medicineService.update(getId(medicine), form);
      else await medicineService.create(form);
      toast.success(medicine ? 'Medicine updated!' : 'Medicine created!');
      onSaved();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const inputClass = "w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
      <h3 className="font-semibold text-slate-800 mb-4">{medicine ? 'Edit' : 'Add'} Medicine</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Name</label><input name="medicine_name" value={form.medicine_name} onChange={handleChange} className={inputClass} required /></div>
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Category</label><select name="category_id" value={form.category_id} onChange={handleCategoryChange} className={inputClass}><option value="">Select</option>{categories.map(c => <option key={getId(c)} value={getId(c)}>{c.name}</option>)}</select></div>
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Manufacturer</label><input name="manufacturer" value={form.manufacturer} onChange={handleChange} className={inputClass} /></div>
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Stock</label><input name="stock" type="number" value={form.stock} onChange={handleChange} className={inputClass} /></div>
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Retail Price</label><input name="retail_price" type="number" step="0.01" value={form.retail_price} onChange={handleChange} className={inputClass} /></div>
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Wholesale Price</label><input name="wholesale_price" type="number" step="0.01" value={form.wholesale_price} onChange={handleChange} className={inputClass} /></div>
        <div><label className="block text-xs font-medium text-slate-600 mb-1">GST %</label><input name="gst_percentage" type="number" value={form.gst_percentage} onChange={handleChange} className={inputClass} /></div>
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Expiry Date</label><input name="expiry_date" type="date" value={form.expiry_date} onChange={handleChange} className={inputClass} /></div>
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Min Wholesale Qty</label><input name="min_wholesale_qty" type="number" value={form.min_wholesale_qty} onChange={handleChange} className={inputClass} /></div>
        <div className="sm:col-span-2"><label className="block text-xs font-medium text-slate-600 mb-1">Description</label><textarea name="description" value={form.description} onChange={handleChange} rows={2} className={inputClass + ' resize-none'} /></div>
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Composition</label><input name="composition" value={form.composition} onChange={handleChange} className={inputClass} /></div>
        <div><label className="block text-xs font-medium text-slate-600 mb-1">Dosage</label><input name="dosage" value={form.dosage} onChange={handleChange} className={inputClass} /></div>
        <div className="flex items-center pt-5"><label className="flex items-center gap-2 text-sm text-slate-700"><input name="prescription_required" type="checkbox" checked={form.prescription_required} onChange={handleChange} className="rounded" /> Prescription Required</label></div>
      </div>
      <div className="flex gap-3 mt-5">
        <button type="submit" disabled={saving} className="px-6 py-2 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 text-sm disabled:opacity-60">{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  );
}
