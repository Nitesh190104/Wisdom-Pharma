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
  const [categoryRefreshVersion, setCategoryRefreshVersion] = useState(0);
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    categoryService.getAll()
      .then(res => setCategories(res.data.data || []))
      .catch(() => {});
  }, [categoryRefreshVersion]);

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

  const handleCategoriesChanged = () => {
    setCategoryRefreshVersion(prev => prev + 1);
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

      <CategoryManager categories={categories} onChanged={handleCategoriesChanged} />

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

function CategoryManager({ categories, onChanged }) {
  const [form, setForm] = useState({ name: '', description: '', image: null, is_active: true });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setForm({ name: '', description: '', image: null, is_active: true });
    setEditing(null);
  };

  const handleEdit = (category) => {
    setEditing(category);
    setForm({
      name: category?.name || '',
      description: category?.description || '',
      image: null,
      is_active: category?.is_active ?? true,
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await categoryService.delete(id);
      toast.success('Category deleted');
      onChanged();
      if ((editing?._id || editing?.id) === id) reset();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing?._id || editing?.id) {
        await categoryService.update(editing._id || editing.id, {
          name: form.name,
          description: form.description,
          is_active: form.is_active,
        });
        toast.success('Category updated');
      } else {
        const fd = new FormData();
        fd.append('name', form.name);
        if (form.description) fd.append('description', form.description);
        if (form.image) fd.append('image', form.image);
        await categoryService.create(fd);
        toast.success('Category created');
      }

      onChanged();
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
    setSaving(false);
  };

  const inputClass = "w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Category Management</h2>
          <p className="text-sm text-slate-500">Create, edit, and delete categories used for medicine organization.</p>
        </div>
        {editing && (
          <button type="button" onClick={reset} className="px-3 py-2 text-sm font-medium rounded-xl border border-slate-200 hover:bg-slate-50">
            Cancel Edit
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
          <input value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} className={inputClass} required />
        </div>
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
          <input value={form.description} onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} className={inputClass} placeholder="Optional" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Image</label>
          <input type="file" accept="image/*" onChange={(e) => setForm(prev => ({ ...prev, image: e.target.files?.[0] || null }))}
            className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200" />
        </div>

        {editing && (
          <div className="lg:col-span-4">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={!!form.is_active} onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.checked }))} className="rounded" />
              Active
            </label>
          </div>
        )}

        <div className="lg:col-span-4">
          <button type="submit" disabled={saving}
            className="px-5 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 text-sm disabled:opacity-60">
            {saving ? 'Saving...' : (editing ? 'Update Category' : 'Add Category')}
          </button>
        </div>
      </form>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border border-slate-200">
              <th className="text-left py-3 px-4 font-medium text-slate-500">Name</th>
              <th className="text-left py-3 px-4 font-medium text-slate-500">Slug</th>
              <th className="text-left py-3 px-4 font-medium text-slate-500">Medicines</th>
              <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
              <th className="text-left py-3 px-4 font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={getId(cat)} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 font-medium text-slate-800">{cat.name}</td>
                <td className="py-3 px-4 text-slate-600">{cat.slug || '—'}</td>
                <td className="py-3 px-4 text-slate-600">{cat.medicines_count ?? '—'}</td>
                <td className="py-3 px-4"><Badge status={(cat.is_active ?? true) ? 'active' : 'inactive'} /></td>
                <td className="py-3 px-4">
                  <div className="flex gap-3">
                    <button type="button" onClick={() => handleEdit(cat)} className="text-xs text-primary-600 font-medium hover:underline">Edit</button>
                    <button type="button" onClick={() => handleDelete(getId(cat))} className="text-xs text-rose-600 font-medium hover:underline">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MedicineForm({ categories, medicine, onSaved }) {
  const [form, setForm] = useState(medicine || {
    medicine_name: '', description: '', category_id: '', category: '', stock: 0,
    retail_price: 0, wholesale_price: 0, gst_percentage: 12, expiry_date: '', manufacturer: '',
    prescription_required: false, dosage: '', composition: '', min_wholesale_qty: 50,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(medicine?.image || null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
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
      const fd = new FormData();
      // Append all form fields
      Object.entries(form).forEach(([key, val]) => {
        if (val !== null && val !== undefined && key !== 'image') {
          fd.append(key, val);
        }
      });
      // Append image file if selected
      if (imageFile) fd.append('image', imageFile);

      if (getId(medicine)) {
        await medicineService.update(getId(medicine), fd);
      } else {
        await medicineService.create(fd);
      }
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

        {/* Image Upload */}
        <div className="sm:col-span-3">
          <label className="block text-xs font-medium text-slate-600 mb-1">Product Image</label>
          <div className="flex items-center gap-4">
            {imagePreview && (
              <img
                src={imagePreview}
                alt="preview"
                className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm bg-slate-50"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            <label className="flex-1 flex flex-col items-center justify-center px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-primary-400 hover:bg-primary-50/30 cursor-pointer transition-all">
              <span className="text-xs font-medium text-slate-500">
                {imageFile ? imageFile.name : 'Click to upload image (JPG, PNG, AVIF, WebP)'}
              </span>
              <input
                id="medicine-image-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif,.avif"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
      <div className="flex gap-3 mt-5">
        <button type="submit" disabled={saving} className="px-6 py-2 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 text-sm disabled:opacity-60">{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  );
}
