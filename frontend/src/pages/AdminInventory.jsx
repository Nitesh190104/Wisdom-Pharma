import { useState, useEffect } from 'react';
import { adminService } from '../services';
import { formatCurrency } from '../utils/formatters';
import { SearchBar, LoadingSpinner, Pagination } from '../components/ui';
import { useDebounce } from '../hooks';
import toast from 'react-hot-toast';

const getId = (item) => item?._id || item?.id;

export default function AdminInventory() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(''); // '', 'low_stock', 'out_of_stock'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setLoading(true);
    const params = { page, per_page: 20 };
    if (debouncedSearch) params.search = debouncedSearch;
    if (filter === 'low_stock') params.low_stock = true;
    if (filter === 'out_of_stock') params.out_of_stock = true;
    adminService.getInventory(params).then(res => {
      setMedicines(res.data.data?.data || []);
      setTotalPages(res.data.data?.last_page || 1);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [page, debouncedSearch, filter]);

  const handleStockUpdate = async (id, newStock) => {
    try {
      await adminService.updateStock(id, parseInt(newStock));
      setMedicines(prev => prev.map(m => getId(m) === id ? { ...m, stock: parseInt(newStock) } : m));
      toast.success('Stock updated');
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Inventory Management</h1>

      <div className="flex gap-4 mb-6">
        <div className="max-w-sm flex-1"><SearchBar value={search} onChange={setSearch} placeholder="Search medicines..." /></div>
        <div className="flex gap-2">
          {[['', 'All'], ['low_stock', '⚠️ Low Stock'], ['out_of_stock', '❌ Out of Stock']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === val ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-500">Medicine</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Category</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Current Stock</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Price</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Update Stock</th>
              </tr></thead>
              <tbody>
                {medicines.map(med => (
                  <tr key={getId(med)} className={`border-b border-slate-100 ${med.stock <= 0 ? 'bg-rose-50/50' : med.stock <= 10 ? 'bg-amber-50/50' : ''}`}>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{med.medicine_name}</p>
                      <p className="text-xs text-slate-400">{med.manufacturer}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{med.category}</td>
                    <td className="py-3 px-4">
                      <span className={`text-lg font-bold ${med.stock <= 0 ? 'text-rose-600' : med.stock <= 10 ? 'text-amber-600' : 'text-emerald-600'}`}>{med.stock}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{formatCurrency(med.retail_price)}</td>
                    <td className="py-3 px-4">
                      {med.stock <= 0 ? <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs font-semibold rounded-full">Out of Stock</span>
                        : med.stock <= 10 ? <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">Low Stock</span>
                        : <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">In Stock</span>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <input type="number" defaultValue={med.stock} min={0}
                          className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                          onBlur={(e) => { if (parseInt(e.target.value) !== med.stock) handleStockUpdate(getId(med), e.target.value); }} />
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
