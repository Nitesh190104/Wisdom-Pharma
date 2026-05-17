import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineMenu, HiOutlineHome, HiOutlineShoppingBag, HiOutlineClipboardList, HiOutlineUsers, HiOutlineCube, HiOutlineChartBar, HiOutlineLogout, HiOutlineBell, HiOutlineDocumentText } from 'react-icons/hi';
import useAuthStore from '../store/useAuthStore';

const adminLinks = [
  { to: '/admin', icon: HiOutlineChartBar, label: 'Dashboard', end: true },
  { to: '/admin/medicines', icon: HiOutlineCube, label: 'Medicines' },
  { to: '/admin/orders', icon: HiOutlineClipboardList, label: 'Orders' },
  { to: '/admin/users', icon: HiOutlineUsers, label: 'Users' },
  { to: '/admin/inventory', icon: HiOutlineShoppingBag, label: 'Inventory' },
  { to: '/admin/prescriptions', icon: HiOutlineDocumentText, label: 'Prescriptions' },
];

const consumerLinks = [
  { to: '/dashboard', icon: HiOutlineHome, label: 'Dashboard', end: true },
  { to: '/orders', icon: HiOutlineClipboardList, label: 'My Orders' },
  { to: '/prescriptions', icon: HiOutlineDocumentText, label: 'Prescriptions' },
];

const storeLinks = [
  { to: '/store', icon: HiOutlineHome, label: 'Dashboard', end: true },
  { to: '/orders', icon: HiOutlineClipboardList, label: 'Orders' },
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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <span className="font-bold text-lg text-slate-800">Wisdom Pharma</span>
        </div>

        <nav className="p-4 space-y-1">
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`}>
              <Icon className="w-5 h-5" />{label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 w-full transition-colors">
            <HiOutlineLogout className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
              <HiOutlineMenu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4 ml-auto">
              <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600">
                <HiOutlineBell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{user?.name?.charAt(0)}</span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
