import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineClipboardList, HiOutlineDocumentText, HiOutlineUser } from 'react-icons/hi';
import useAuthStore from '../store/useAuthStore';
import { orderService } from '../services';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Badge, StatsCard, LoadingSpinner } from '../components/ui';

export default function ConsumerDashboard() {
  const { user } = useAuthStore();
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getAll({ per_page: 5 }).then(res => setRecentOrders(res.data.data?.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Welcome back, {user?.name}!</h1>
        <p className="text-slate-500 mt-1">Here's an overview of your account</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-6 mb-8">
        <StatsCard icon={HiOutlineClipboardList} label="Total Orders" value={recentOrders.length} color="primary" />
        <StatsCard icon={HiOutlineDocumentText} label="Prescriptions" value="0" color="emerald" />
        <StatsCard icon={HiOutlineUser} label="Account Status" value={user?.is_approved ? 'Active' : 'Pending'} color="amber" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Recent Orders</h2>
          <Link to="/orders" className="text-sm text-primary-600 font-medium hover:underline">View All</Link>
        </div>
        {loading ? <LoadingSpinner /> : recentOrders.length === 0 ? (
          <p className="text-sm text-slate-500 py-8 text-center">No orders yet. <Link to="/medicines" className="text-primary-600 hover:underline">Start shopping!</Link></p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-500">Order #</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Date</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Total</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
              </tr></thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-800">{order.order_number}</td>
                    <td className="py-3 px-4 text-slate-600">{formatDate(order.created_at)}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{formatCurrency(order.total)}</td>
                    <td className="py-3 px-4"><Badge status={order.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
