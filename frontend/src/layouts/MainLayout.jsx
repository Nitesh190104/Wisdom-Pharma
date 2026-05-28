import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useAuthStore from '../store/useAuthStore';
import CustomerChatbot from '../components/CustomerChatbot';

export default function MainLayout() {
  const { token, user } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {token && user && user.role !== 'admin' && <CustomerChatbot />}
    </div>
  );
}
