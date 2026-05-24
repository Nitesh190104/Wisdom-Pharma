import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineShieldCheck, HiOutlineTruck, HiOutlineCurrencyRupee, HiOutlineUserGroup, HiOutlineArrowRight } from 'react-icons/hi';
import MedicineCard from '../components/MedicineCard';
import { medicineService, categoryService } from '../services';
import useAuthStore from '../store/useAuthStore';


const features = [
  { icon: HiOutlineShieldCheck, title: 'Verified Medicines', desc: 'All medicines are 100% authentic and sourced directly from manufacturers.' },
  { icon: HiOutlineTruck, title: 'Fast Delivery', desc: 'Get your medicines delivered within 2-5 business days across India.' },
  { icon: HiOutlineCurrencyRupee, title: 'Best Prices', desc: 'Competitive retail pricing with GST and exclusive wholesale rates.' },
  { icon: HiOutlineUserGroup, title: 'B2B & B2C', desc: 'Serving both individual consumers and medical stores with tailored pricing.' },
];

const getCategoryEmoji = (slug) => {
  switch (slug) {
    case 'critical-care-injections':
      return '💉';
    case 'specialty-oral-tablets':
      return '💊';
    case 'medical-surgical-supplies':
      return '🩹';
    case 'surgical-instruments':
      return '🔬';
    default:
      return '💊';
  }
};

export default function Home() {
  const { user } = useAuthStore();
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [medRes, catRes] = await Promise.all([
          medicineService.getFeatured(),
          categoryService.getAll(),
        ]);
        setMedicines(medRes.data.data || []);
        setCategories(catRes.data.data || []);
      } catch (error) {
        console.error('Failed to load homepage data', error);
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center px-4 py-1.5 bg-white/10 backdrop-blur rounded-full text-sm text-primary-100 font-medium mb-6 border border-white/20">
                🏥 Trusted by 500+ Medical Stores
              </span>
              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Your Trusted <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-200">Pharmaceutical</span><br />
                Partner
              </h1>
              <p className="text-lg text-primary-100 mb-8 max-w-lg leading-relaxed">
                Buy genuine medicines at the best prices. Wholesale rates for medical stores, retail with GST for consumers. Fast delivery across India.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/medicines" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-colors shadow-lg shadow-black/10">
                  Browse Medicines <HiOutlineArrowRight className="w-4 h-4" />
                </Link>
                {user ? (
                  <Link to="/profile" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors">
                    View Profile
                  </Link>
                ) : (
                  <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors">
                    Register as Store
                  </Link>
                )}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-8xl mb-4">💊</div>
                    <p className="text-white font-semibold text-xl">Quality Healthcare</p>
                    <p className="text-primary-200 text-sm mt-2">At Your Doorstep</p>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-emerald-400/20 backdrop-blur rounded-2xl flex items-center justify-center border border-emerald-300/30 animate-float">
                  <span className="text-3xl">🏥</span>
                </div>
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-cyan-400/20 backdrop-blur rounded-2xl flex items-center justify-center border border-cyan-300/30 animate-float" style={{ animationDelay: '1s' }}>
                  <span className="text-4xl">🔬</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-800">Why Choose <span className="text-primary-600">Wisdom Pharma?</span></h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">We provide the best pharmaceutical solutions for both businesses and consumers</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-slate-200 hover:border-primary-200 hover:shadow-lg transition-all duration-300 group">
                <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">Shop by Category</h2>
                <p className="text-slate-500 mt-2">Browse medicines by therapeutic category</p>
              </div>
              <Link to="/medicines" className="text-primary-600 font-medium text-sm hover:underline flex items-center gap-1">
                View All <HiOutlineArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.slice(0, 8).map((cat, i) => (
                <motion.div key={cat._id || cat.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <Link to={`/medicines?category=${cat._id || cat.id}`}
                    className="block p-5 bg-white rounded-2xl border border-slate-200 hover:border-primary-200 hover:shadow-md transition-all text-center group">
                    <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-100 transition-colors">
                      <span className="text-2xl">{getCategoryEmoji(cat.slug)}</span>
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm">{cat.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{cat.medicines_count || 0} products</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Medicines */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">Featured Medicines</h2>
              <p className="text-slate-500 mt-2">Top quality medicines at best prices</p>
            </div>
            <Link to="/medicines" className="text-primary-600 font-medium text-sm hover:underline flex items-center gap-1">
              View All <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="h-48 skeleton" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 skeleton rounded w-1/3" />
                    <div className="h-5 skeleton rounded w-2/3" />
                    <div className="h-6 skeleton rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {medicines.slice(0, 8).map((med) => (
                <MedicineCard key={med._id || med.id} medicine={med} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {user ? 'Need Any Assistance?' : 'Ready to Get Started?'}
          </h2>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto">
            {user 
              ? 'Our support team is here to help you 24/7 with order queries, prescription uploads, or wholesale pricing.' 
              : 'Join thousands of medical stores and consumers who trust Wisdom Pharma for their pharmaceutical needs.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {user ? (
              <>
                <Link to="/medicines" className="px-8 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-colors shadow-lg">Shop Now</Link>
                <Link to="/contact" className="px-8 py-3 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors">Contact Support</Link>
              </>
            ) : (
              <>
                <Link to="/register" className="px-8 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-colors shadow-lg">Create Account</Link>
                <Link to="/contact" className="px-8 py-3 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors">Contact Sales</Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
