import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { AppProvider } from './context/AppContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Route Guards
import { ProtectedRoute, RoleRoute, GuestRoute } from './routes/Guards';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import MedicinesList from './pages/MedicinesList';
import MedicineDetail from './pages/MedicineDetail';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Consumer Pages
import ConsumerDashboard from './pages/ConsumerDashboard';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Prescriptions from './pages/Prescriptions';

// Store Pages
import StoreDashboard from './pages/StoreDashboard';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminMedicines from './pages/AdminMedicines';
import AdminUsers from './pages/AdminUsers';
import AdminOrders from './pages/AdminOrders';
import AdminInventory from './pages/AdminInventory';
import AdminPrescriptions from './pages/AdminPrescriptions';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '12px', background: '#1e293b', color: '#fff', fontSize: '14px' },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#f43f5e', secondary: '#fff' } },
          }}
        />

        <AnimatePresence mode="wait">
          <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          </Route>

          {/* Consumer Dashboard Routes */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<RoleRoute roles={['consumer']}><ConsumerDashboard /></RoleRoute>} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/prescriptions" element={<Prescriptions />} />
          </Route>

          {/* Store Dashboard Routes */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/store" element={<RoleRoute roles={['store']}><StoreDashboard /></RoleRoute>} />
          </Route>

          {/* Admin Dashboard Routes */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/admin" element={<RoleRoute roles={['admin']}><AdminDashboard /></RoleRoute>} />
            <Route path="/admin/medicines" element={<RoleRoute roles={['admin']}><AdminMedicines /></RoleRoute>} />
            <Route path="/admin/users" element={<RoleRoute roles={['admin']}><AdminUsers /></RoleRoute>} />
            <Route path="/admin/orders" element={<RoleRoute roles={['admin']}><AdminOrders /></RoleRoute>} />
            <Route path="/admin/inventory" element={<RoleRoute roles={['admin']}><AdminInventory /></RoleRoute>} />
            <Route path="/admin/prescriptions" element={<RoleRoute roles={['admin']}><AdminPrescriptions /></RoleRoute>} />
          </Route>

          {/* Public Routes */}
          <Route element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/medicines" element={<MedicinesList />} />
            <Route path="/medicines/:id" element={<MedicineDetail />} />
            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          </Route>

          {/* 404 */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-slate-300">404</h1>
                <p className="text-xl text-slate-600 mt-4">Page not found</p>
                <a href="/" className="inline-block mt-6 px-6 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors">Go Home</a>
              </div>
            </div>
          } />
          </Routes>
        </AnimatePresence>
      </AppProvider>
    </BrowserRouter>
  );
}
