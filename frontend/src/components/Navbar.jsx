import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineShoppingCart, HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import useAuthStore from '../store/useAuthStore';
import { useAppContext } from '../context/useAppContext';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { cartCount } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = user?.role === 'admin'
    ? [
        { to: '/admin', label: 'Dashboard', end: true },
        { to: '/admin/medicines', label: 'Medicines' },
        { to: '/admin/about', label: 'About' },
      ]
    : [
        { to: '/', label: 'Home', end: true },
        { to: '/medicines', label: 'Medicines' },
        { to: '/about', label: 'About' },
        { to: '/contact', label: 'Contact' },
      ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
              <span className="text-white font-bold text-lg">W</span>
            </div>
            <div>
              <span className="font-bold text-lg text-slate-800">Wisdom</span>
              <span className="font-bold text-lg text-primary-600"> Pharma</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={!!end}
                className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'}`}>
                {label}
              </NavLink>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {user && user.role !== 'admin' && (
              <Link to="/checkout" className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
                <HiOutlineShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </motion.span>
                )}
              </Link>
            )}

            {user ? (
              <div className="hidden md:flex items-center gap-2 relative">
                <button onClick={() => setProfileOpen(!profileOpen)} className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold hover:shadow-md transition-all shadow-primary-500/30 border-2 border-white">
                  {user.name.charAt(0).toUpperCase()}
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-14 right-0 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2">
                      <div className="px-4 py-3 border-b border-slate-100 mb-2 bg-slate-50/50">
                        <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                      {user.role === 'admin' ? (
                        <Link to="/admin" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">Dashboard</Link>
                      ) : (
                        <>
                          <Link to="/profile" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">Profile Settings</Link>
                          <Link to="/orders" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">Order History</Link>
                        </>
                      )}
                      <div className="border-t border-slate-100 mt-2 pt-2">
                        <button onClick={() => { handleLogout(); setProfileOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors">Logout</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">Login</Link>
                <Link to="/register" className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm">Register</Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-slate-100">
              {mobileOpen ? <HiOutlineX className="w-5 h-5" /> : <HiOutlineMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-slate-200 bg-white overflow-hidden">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(({ to, label, end }) => (
                <NavLink key={to} to={to} end={!!end} onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `block px-4 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600'}`}>
                  {label}
                </NavLink>
              ))}
              {user ? (
                <>
                  {user.role !== 'admin' && (
                    <>
                      <Link to="/profile" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600">Profile Settings</Link>
                      <Link to="/orders" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600">Order History</Link>
                    </>
                  )}
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-rose-600">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600">Login</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-primary-700 bg-primary-50">Register</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
