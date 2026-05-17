import { motion } from 'framer-motion';
import { HiOutlineHeart, HiOutlineGlobe, HiOutlineLightBulb, HiOutlineShieldCheck } from 'react-icons/hi';

const values = [
  { icon: HiOutlineHeart, title: 'Patient First', desc: 'Every decision we make starts with the patients welfare in mind.' },
  { icon: HiOutlineShieldCheck, title: 'Quality Assured', desc: 'Only genuine, certified medicines from authorized manufacturers.' },
  { icon: HiOutlineGlobe, title: 'Pan-India Reach', desc: 'Serving medical stores and consumers across all states of India.' },
  { icon: HiOutlineLightBulb, title: 'Innovation', desc: 'Using technology to make pharmaceutical distribution efficient and transparent.' },
];

const stats = [
  { value: '500+', label: 'Medical Stores' },
  { value: '10K+', label: 'Products' },
  { value: '50K+', label: 'Orders Delivered' },
  { value: '98%', label: 'Satisfaction Rate' },
];

export default function About() {
  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">About Wisdom Pharma</h1>
            <p className="text-primary-100 max-w-2xl mx-auto text-lg">Bridging the gap between pharmaceutical manufacturers and healthcare providers with technology-driven distribution.</p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-bold text-slate-800 mb-6">Our Mission</h2>
              <p className="text-slate-600 mb-4 leading-relaxed">Wisdom Pharma is a modern pharmaceutical e-commerce platform that serves both businesses (B2B) and consumers (B2C). We connect medical stores directly with pharmaceutical manufacturers, enabling bulk purchases at competitive wholesale prices.</p>
              <p className="text-slate-600 mb-4 leading-relaxed">For individual consumers, we provide a convenient way to purchase authentic medicines at fair retail prices with complete GST transparency. Our platform ensures that every medicine listed is genuine, properly stored, and delivered within promised timelines.</p>
              <p className="text-slate-600 leading-relaxed">Founded with the vision of democratizing access to affordable healthcare, we leverage technology to streamline the pharmaceutical supply chain, reduce costs, and ensure medication reaches those who need it most.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-3xl p-12 flex items-center justify-center">
              <div className="text-center">
                <div className="text-8xl mb-6">🏥</div>
                <h3 className="text-2xl font-bold text-slate-800">Healthcare for All</h3>
                <p className="text-slate-500 mt-2">Making quality medicines accessible and affordable</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center">
                <p className="text-4xl font-bold text-white">{s.value}</p>
                <p className="text-primary-200 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-800">Our Core Values</h2>
            <p className="text-slate-500 mt-3">The principles that guide everything we do</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-2xl border border-slate-200 text-center hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <v.icon className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{v.title}</h3>
                <p className="text-sm text-slate-500">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
