import { useState, useEffect } from 'react';
import { adminService } from '../services';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Badge, LoadingSpinner, Pagination } from '../components/ui';
import toast from 'react-hot-toast';

const getId = (item) => item?._id || item?.id;

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = { page, per_page: 15 };
    if (statusFilter) params.status = statusFilter;
    if (typeFilter) params.type = typeFilter;
    adminService.getAllOrders(params).then(res => {
      setOrders(res.data.data?.data || []);
      setTotalPages(res.data.data?.last_page || 1);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [page, statusFilter, typeFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => getId(o) === orderId ? { ...o, status: newStatus } : o));
      toast.success('Order status updated');
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Order Management</h1>

      <div className="flex gap-4 mb-4">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20">
          <option value="">All Statuses</option>
          {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20">
          <option value="">All Types</option>
          <option value="retail">Retail</option>
          <option value="wholesale">Wholesale</option>
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-500">Order #</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Type</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Total</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Date</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Update</th>
              </tr></thead>
              <tbody>
                {orders.map(order => (
                  <tr key={getId(order)} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-800">{order.order_number}</td>
                    <td className="py-3 px-4 text-slate-600">{order.user?.name || 'N/A'}</td>
                    <td className="py-3 px-4 capitalize text-slate-600">{order.type}</td>
                    <td className="py-3 px-4 font-medium">{formatCurrency(order.total)}</td>
                    <td className="py-3 px-4"><Badge status={order.status} /></td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(order.created_at)}</td>
                    <td className="py-3 px-4">
                      <select value={order.status} onChange={(e) => handleStatusChange(getId(order), e.target.value)}
                        className="px-2 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none">
                        {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4"><Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} /></div>
        </div>
      )}
    </div>
  );
}
