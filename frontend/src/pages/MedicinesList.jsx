import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import MedicineCard from '../components/MedicineCard';
import { SearchBar, Pagination, LoadingSpinner } from '../components/ui';
import { medicineService, categoryService } from '../services';
import { useDebounce } from '../hooks';

export default function MedicinesList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('created_at_desc');

  const debouncedSearch = useDebounce(search, 400);

  const fetchMedicines = useCallback(async () => {
    setLoading(true);
    try {
      let sort_by = 'created_at';
      let sort_order = 'desc';

      if (sortBy === 'retail_price_asc') {
        sort_by = 'retail_price';
        sort_order = 'asc';
      } else if (sortBy === 'retail_price_desc') {
        sort_by = 'retail_price';
        sort_order = 'desc';
      } else if (sortBy === 'medicine_name_asc') {
        sort_by = 'medicine_name';
        sort_order = 'asc';
      }

      const params = { page, per_page: 12, sort_by, sort_order };
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedCategory) params.category_id = selectedCategory;
      const { data } = await medicineService.getAll(params);
      setMedicines(data.data?.data || []);
      setTotalPages(data.data?.last_page || 1);
    } catch (error) {
      console.error('Failed to load medicines', error);
    } finally { setLoading(false); }
  }, [page, debouncedSearch, selectedCategory, sortBy]);

  useEffect(() => { fetchMedicines(); }, [fetchMedicines]);

  useEffect(() => {
    categoryService.getAll()
      .then(res => setCategories(res.data.data || []))
      .catch(error => console.error('Failed to load categories', error));
  }, []);

  useEffect(() => {
    const nextParams = {};
    if (debouncedSearch) nextParams.search = debouncedSearch;
    if (selectedCategory) nextParams.category = selectedCategory;
    setSearchParams(nextParams, { replace: true });
  }, [debouncedSearch, selectedCategory, setSearchParams]);

  const memoizedMedicineList = useMemo(() => (
    medicines.map(med => <MedicineCard key={med.id || med._id} medicine={med} />)
  ), [medicines]);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-2">All Medicines</h1>
          <p className="text-primary-100">Browse our complete range of pharmaceutical products</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-20">
              <h3 className="font-semibold text-slate-800 mb-4">Filters</h3>

              <div className="mb-5">
                <SearchBar value={search} onChange={setSearch} placeholder="Search medicines..." />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400">
                  <option value="">All Categories</option>
                  {categories.map(cat => <option key={cat.id || cat._id} value={cat.id || cat._id}>{cat.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400">
                  <option value="created_at_desc">Newest First</option>
                  <option value="retail_price_asc">Price: Low to High</option>
                  <option value="retail_price_desc">Price: High to Low</option>
                  <option value="medicine_name_asc">Name: A-Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Medicine Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <LoadingSpinner size="lg" text="Loading medicines..." />
            ) : medicines.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-slate-700">No medicines found</h3>
                <p className="text-slate-500 mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-slate-500">{medicines.length} medicines found</p>
                </div>
                <motion.div layout className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {memoizedMedicineList}
                </motion.div>
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
