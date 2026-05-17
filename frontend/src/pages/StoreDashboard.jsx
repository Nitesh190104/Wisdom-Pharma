import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineClipboardList, HiOutlineCube, HiOutlineCurrencyRupee, HiOutlineShieldCheck } from 'react-icons/hi';
import useAuthStore from '../store/useAuthStore';
import { orderService } from '../services';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Badge, StatsCard, LoadingSpinner } from '../components/ui';

export default function StoreDashboard() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getAll({ per_page: 10 }).then(res => setOrders(res.data.data?.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const isVerified = user?.business?.is_verified;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">{user?.business?.business_name || 'Store Dashboard'}</h1>
        <p className="text-slate-500 mt-1">Manage your wholesale orders and business</p>
      </div>

      {!isVerified && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
          <p className="text-amber-800 font-medium">⏳ Your business account is pending verification. You'll be able to place wholesale orders once approved.</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard icon={HiOutlineClipboardList} label="Total Orders" value={orders.length} color="primary" />
        <StatsCard icon={HiOutlineCurrencyRupee} label="Total Spent" value={formatCurrency(orders.reduce((sum, o) => sum + (o.total || 0), 0))} color="emerald" />
        <StatsCard icon={HiOutlineCube} label="Items Ordered" value={orders.reduce((sum, o) => sum + (o.items?.length || 0), 0)} color="amber" />
        <StatsCard icon={HiOutlineShieldCheck} label="Verification" value={isVerified ? 'Verified' : 'Pending'} color={isVerified ? 'emerald' : 'amber'} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Wholesale Orders</h2>
          <Link to="/medicines" className="text-sm text-primary-600 font-medium hover:underline">Place New Order</Link>
        </div>
        {loading ? <LoadingSpinner /> : orders.length === 0 ? (
          <p className="text-sm text-slate-500 py-8 text-center">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-500">Order #</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Date</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Items</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Total</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
              </tr></thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-800">{order.order_number}</td>
                    <td className="py-3 px-4 text-slate-600">{formatDate(order.created_at)}</td>
                    <td className="py-3 px-4 text-slate-600">{order.items?.length || 0}</td>
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
