import { useState, useEffect } from 'react';
import { HiOutlineClipboardList } from 'react-icons/hi';
import { orderService } from '../services';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Badge, LoadingSpinner, EmptyState, Pagination } from '../components/ui';
import toast from 'react-hot-toast';

const getId = (item) => item?._id || item?.id;

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = { page, per_page: 10 };
    if (statusFilter) params.status = statusFilter;
    orderService.getAll(params).then(res => {
      setOrders(res.data.data?.data || []);
      setTotalPages(res.data.data?.last_page || 1);
    }).catch(error => console.error('Failed to load orders', error)).finally(() => setLoading(false));
  }, [page, statusFilter]);

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await orderService.cancel(id, 'Cancelled by user');
      toast.success('Order cancelled');
      setOrders(prev => prev.map(o => getId(o) === id ? { ...o, status: 'cancelled' } : o));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to cancel'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Orders</h1>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20">
          <option value="">All Statuses</option>
          {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
      </div>

      {loading ? <LoadingSpinner size="lg" /> : orders.length === 0 ? (
        <EmptyState icon={HiOutlineClipboardList} title="No orders found" description="You haven't placed any orders yet." />
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={getId(order)} className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-slate-800">{order.order_number}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge status={order.status} />
                  {(order.status === 'pending' || order.status === 'confirmed') && (
                    <button onClick={() => handleCancel(getId(order))} className="text-xs text-rose-600 font-medium hover:underline">Cancel</button>
                  )}
                </div>
              </div>
              <div className="space-y-2 mb-4">
                {order.items?.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-slate-600">{item.medicine_name} ×{item.quantity}</span>
                    <span className="text-slate-700 font-medium">{formatCurrency(item.total || item.subtotal)}</span>
                  </div>
                ))}
                {(order.items?.length || 0) > 3 && <p className="text-xs text-slate-400">+{order.items.length - 3} more items</p>}
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-400 capitalize">{order.type} order</span>
                <span className="font-bold text-slate-800">{formatCurrency(order.total)}</span>
              </div>
            </div>
          ))}
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
