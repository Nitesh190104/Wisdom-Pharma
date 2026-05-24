import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineMenu, HiOutlineHome, HiOutlineShoppingBag, HiOutlineClipboardList, HiOutlineUsers, HiOutlineCube, HiOutlineChartBar, HiOutlineLogout, HiOutlineDocumentText } from 'react-icons/hi';
import useAuthStore from '../store/useAuthStore';
import Navbar from '../components/Navbar';

const adminLinks = [
  { to: '/admin', icon: HiOutlineChartBar, label: 'Dashboard', end: true },
  { to: '/admin/medicines', icon: HiOutlineCube, label: 'Medicines' },
  { to: '/admin/about', icon: HiOutlineDocumentText, label: 'About' },
  { to: '/admin/orders', icon: HiOutlineClipboardList, label: 'Orders' },
  { to: '/admin/users', icon: HiOutlineUsers, label: 'Users' },
  { to: '/admin/inventory', icon: HiOutlineShoppingBag, label: 'Inventory' },
];

const consumerLinks = [
  { to: '/orders', icon: HiOutlineClipboardList, label: 'My Orders', end: true },
  { to: '/prescriptions', icon: HiOutlineDocumentText, label: 'Prescriptions' },
];

const storeLinks = [
  { to: '/orders', icon: HiOutlineClipboardList, label: 'Orders', end: true },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'store' ? storeLinks : consumerLinks;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Universal Responsive Navbar */}
      <Navbar />

      <div className="flex-1 flex relative">
        {/* Sidebar (Docks under Navbar) */}
        <aside className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 transform transition-transform duration-300 lg:translate-x-0 lg:sticky lg:h-[calc(100vh-4rem)] ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            <div className="px-6 py-4 border-b border-slate-100/80 bg-slate-50/50 hidden lg:block">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Navigation Panel</p>
            </div>

            <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
              {links.map(({ to, icon: Icon, label, end }) => (
                <NavLink 
                  key={to} 
                  to={to} 
                  end={end} 
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary-50 text-primary-700 shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="p-4 border-t border-slate-100">
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 w-full transition-colors"
              >
                <HiOutlineLogout className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-30 lg:hidden" 
              onClick={() => setSidebarOpen(false)} 
            />
          )}
        </AnimatePresence>

        {/* Main Content Pane */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile top-trigger header */}
          <header className="lg:hidden sticky top-16 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex items-center justify-between">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            >
              <HiOutlineMenu className="w-5 h-5" />
            </button>
            <span className="font-bold text-slate-800 text-sm capitalize">{user?.role} Portal</span>
          </header>

          <main className="flex-1 p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
