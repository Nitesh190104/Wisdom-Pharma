import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Dynamic Navigation Header */}
      <Navbar />

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 relative overflow-hidden">
        {/* Decorative ambient blurs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-md my-8"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8">
            <Outlet />
          </div>
        </motion.div>
      </div>

      {/* Responsive Footer */}
      <Footer />
    </div>
  );
}
